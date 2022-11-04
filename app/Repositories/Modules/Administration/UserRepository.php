<?php

namespace App\Repositories\Modules\Administration;;

use App\Repositories\Contracts\RepositoryInterface;
use Illuminate\Support\Collection;
// Model
use App\Models\Users\User;
use App\Models\Profiles\Profile;

class UserRepository implements RepositoryInterface
{
    public function __construct(User $userModel, Profile $profileModel)
    {
        $this->userModel = $userModel;
        $this->profileModel = $profileModel;
    }

    function getPaginate(string $limit, string $order_by, string $page_number, string $search, array $filters)
    {
        return $this->userModel->with(["profile:id,name"])
            ->search($search) // scope
            ->filter($filters) // scope
            ->orderBy($order_by)
            ->paginate((int) $limit, $columns = ['*'], $pageName = 'page', (int) $page_number);
    }

    function createOne(Collection $data)
    {
        return $this->userModel->create($data->only(["name", "email", "profile_id", "password"])->all());
    }

    function updateOne(Collection $data, string $identifier)
    {
        $user = $this->userModel->findOrFail($identifier);

        $new_profile = $this->profileModel->findOrFail($data->get("profile_id"));

        // Check if user is related to a active service order with different role
        foreach ($user->service_orders as $service_order) {
            if ($service_order->status) {
                if (strtolower($service_order->pivot->role) != strtolower($new_profile->name)) {
                    return response(["message" => "Possui vínculo como {$service_order->pivot->role} a uma ordem de serviço ativa!"], 500);
                }
            }
        }

        $user->update($data->only(["name", "email", "profile_id"])->all());

        $user->refresh();

        return response(["message" => "Usuário atualizado com sucesso!"], 200);
    }

    function deleteOne(string $identifier)
    {
        $user = $this->userModel->findOrFail($identifier);

        // Check if user is related to a active service order 
        foreach ($user->service_orders as $service_order) {
            if ($service_order->status) {
                return response(["message" => "Possui vínculo com uma ordem de serviço ativa!"], 500);
            }
        }

        $user->delete();

        return response(["message" => "O usuário possui vínculo com uma ordem de serviço ativa!"], 200);
    }
}
