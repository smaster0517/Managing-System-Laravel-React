<?php

namespace App\Repositories\Modules\Administration;;

use App\Contracts\RepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
// Model
use App\Models\Profiles\Profile;

class ProfileRepository implements RepositoryInterface
{
    public function __construct(Profile $profileModel)
    {
        $this->profileModel = $profileModel;
    }

    function getPaginate(string $limit, string $order_by, string $page_number, string $search, array $filters)
    {
        return $this->profileModel->with("modules")
            ->search($search) // scope
            ->filter($filters) // scope
            ->orderBy($order_by)
            ->paginate((int) $limit, $columns = ['*'], $pageName = 'page', (int) $page_number);
    }

    function createOne(Collection $data)
    {
        $profile = DB::transaction(function () use ($data) {

            $profile = $this->profileModel->create($data->only(["name"])->all());

            // *Turn into loop*
            $profile->modules()->attach(1, ["read" => false, "write" => false]);
            $profile->modules()->attach(2, ["read" => false, "write" => false]);
            $profile->modules()->attach(3, ["read" => false, "write" => false]);
            $profile->modules()->attach(4, ["read" => false, "write" => false]);
            $profile->modules()->attach(5, ["read" => false, "write" => false]);
            $profile->modules()->attach(6, ["read" => false, "write" => false]);

            return $profile;
        });

        return $profile;
    }

    function updateOne(Collection $data, string $identifier)
    {
        $profile = DB::transaction(function () use ($data, $identifier) {

            $profile = $this->profileModel->findOrFail($identifier);

            $profile->update($data->only(["name"])->all());

            // *Turn into loop*
            $profile->modules()->sync([
                1 => [
                    'read' => $data->get("privileges")[1]["read"],
                    'write' => $data->get("privileges")[1]["write"]
                ],
                2 => [
                    'read' => $data->get("privileges")[2]["read"],
                    'write' => $data->get("privileges")[2]["write"]
                ],
                3 => [
                    'read' => $data->get("privileges")[3]["read"],
                    'write' => $data->get("privileges")[3]["write"]
                ],
                4 => [
                    'read' => $data->get("privileges")[4]["read"],
                    'write' => $data->get("privileges")[4]["write"]
                ],
                5 => [
                    'read' => $data->get("privileges")[5]["read"],
                    'write' => $data->get("privileges")[5]["write"]
                ],
                6 => [
                    'read' => $data->get("privileges")[6]["read"],
                    'write' => $data->get("privileges")[6]["write"]
                ]
            ]);

            $profile->refresh();

            return $profile;
        });

        return $profile;
    }

    function deleteOne(string $identifier)
    {
        $profile = $this->profileModel->findOrFail($identifier);

        // Turn all related users into visitants
        if (!empty($profile->users)) {
            $profile->users()->update(["profile_id" => 5]);
        }

        $profile->delete();

        return $profile;
    }
}