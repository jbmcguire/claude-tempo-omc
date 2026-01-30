# Tempo Backend Patterns

Reference document for Laravel patterns used in the Tempo codebase.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         HTTP Request                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Form Request                               │
│              (Validation & Authorization)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Controller                               │
│                    (Thin - delegates)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Service                                 │
│                   (Business Logic)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌───────────────────┐ ┌─────────────┐ ┌─────────────┐
│    Repository     │ │    Jobs     │ │   Events    │
│  (Data Access)    │ │  (Queued)   │ │ (Dispatch)  │
└───────────────────┘ └─────────────┘ └─────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Model                                   │
│              (Eloquent - Data & Relations)                      │
└─────────────────────────────────────────────────────────────────┘
```

## Controllers

### Pattern
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSettlementRequest;
use App\Http\Resources\SettlementResource;
use App\Models\Settlement;
use App\Services\SettlementService;

class SettlementController extends Controller
{
    public function __construct(
        private SettlementService $settlementService
    ) {}

    public function index()
    {
        $settlements = $this->settlementService->listForUser(auth()->user());
        return SettlementResource::collection($settlements);
    }

    public function store(StoreSettlementRequest $request): SettlementResource
    {
        $settlement = $this->settlementService->create($request->validated());
        return new SettlementResource($settlement);
    }

    public function show(Settlement $settlement): SettlementResource
    {
        $this->authorize('view', $settlement);
        return new SettlementResource($settlement->load(['carrier', 'lineItems']));
    }
}
```

### Rules
- Inject services via constructor
- Use Form Requests for validation
- Return API Resources
- Use route model binding
- Authorize in controller or Form Request

## Services

### Pattern
```php
<?php

namespace App\Services;

use App\Models\Settlement;
use App\Models\User;
use App\Repositories\SettlementRepository;
use App\Events\SettlementApproved;
use App\Exceptions\SettlementException;

class SettlementService
{
    public function __construct(
        private SettlementRepository $repository,
        private NotificationService $notifications
    ) {}

    public function create(array $data): Settlement
    {
        $settlement = $this->repository->create($data);
        
        // Dispatch events, queue jobs, etc.
        
        return $settlement;
    }

    public function approve(Settlement $settlement, User $approver): Settlement
    {
        // Business rule validation
        if (!$settlement->canBeApproved()) {
            throw new SettlementException('Settlement cannot be approved');
        }

        $settlement = $this->repository->approve($settlement, $approver);
        
        event(new SettlementApproved($settlement));
        $this->notifications->settlementApproved($settlement);

        return $settlement;
    }
}
```

### Rules
- One service per domain concept
- Inject dependencies
- Return models/DTOs, not responses
- Throw exceptions for errors
- Dispatch events for side effects

## Form Requests

### Pattern
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSettlementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Settlement::class);
    }

    public function rules(): array
    {
        return [
            'carrier_id' => ['required', 'exists:carriers,id'],
            'amount' => ['required', 'numeric', 'min:0'],
            'line_items' => ['required', 'array', 'min:1'],
            'line_items.*.description' => ['required', 'string'],
            'line_items.*.amount' => ['required', 'numeric'],
        ];
    }

    public function messages(): array
    {
        return [
            'carrier_id.exists' => 'The selected carrier does not exist.',
        ];
    }
}
```

## API Resources

### Pattern
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettlementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference_number' => $this->reference_number,
            'carrier_id' => $this->carrier_id,
            'carrier' => new CarrierResource($this->whenLoaded('carrier')),
            'amount' => $this->amount,
            'status' => $this->status,
            'line_items' => SettlementLineItemResource::collection(
                $this->whenLoaded('lineItems')
            ),
            'approved_at' => $this->approved_at?->toISOString(),
            'approved_by' => new UserResource($this->whenLoaded('approvedBy')),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
```

## Models

### Pattern
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Settlement extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'carrier_id',
        'reference_number',
        'amount',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    // Relationships
    public function carrier(): BelongsTo
    {
        return $this->belongsTo(Carrier::class);
    }

    public function lineItems(): HasMany
    {
        return $this->hasMany(SettlementLineItem::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    // Business Logic Helpers
    public function canBeApproved(): bool
    {
        return $this->status === 'pending' && $this->amount > 0;
    }
}
```

## Routes

### Pattern
```php
// routes/api.php

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('settlements', SettlementController::class);
    
    // Custom actions
    Route::post('settlements/{settlement}/approve', [SettlementController::class, 'approve']);
    Route::post('settlements/{settlement}/reject', [SettlementController::class, 'reject']);
});
```

## Testing

### Feature Test Pattern
```php
<?php

namespace Tests\Feature;

use App\Models\Settlement;
use App\Models\User;
use Tests\TestCase;

class SettlementTest extends TestCase
{
    public function test_can_list_settlements(): void
    {
        $user = User::factory()->create();
        Settlement::factory()->count(3)->create();

        $response = $this->actingAs($user)
            ->getJson('/api/settlements');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_can_approve_settlement(): void
    {
        $user = User::factory()->admin()->create();
        $settlement = Settlement::factory()->pending()->create();

        $response = $this->actingAs($user)
            ->postJson("/api/settlements/{$settlement->id}/approve");

        $response->assertOk();
        $this->assertEquals('approved', $settlement->fresh()->status);
    }
}
```
