<?php
namespace Package\Raxon\Issue\Output\Filter\Application;

use Entity\User as Entity;
use Raxon\App;

use Raxon\Doctrine\Module\Database;
use Raxon\Exception\ErrorException;
use Raxon\Module\Controller;

class Issue extends Controller {
    const DIR = __DIR__ . '/';

    public static function filter(App $object, $response=null): array | object
    {
        $result = [];
        $user = [];
        if(
            !empty($response) &&
            (
                is_object($response) ||
                is_array($response)
            )
        ) {
            foreach ($response as $nr => $record) {
                if (
                    is_object($record) &&
                    property_exists($record, 'user')
                ) {
                    if(!in_array($record->user, $user, true)){
                        $user[] = $record->user;
                    }
                }
            }
        }
        $config = Database::config($object);
        $connection = $object->config('doctrine.environment.system.*');
        if($connection === null){
            throw new ErrorException('Connection not configured.');
        }
        $connection->manager = Database::entity_manager($object, $config, $connection);
        $repository = $connection->manager->getRepository(Entity::class);
        $user_list = $repository->findBy([
            'uuid' => $user
        ]);
        $user = [];
        foreach($user_list as $entity){
            $user[$entity->getUuid()] = $entity;
        }
        if(
            !empty($response) &&
            (
                is_object($response) ||
                is_array($response)
            )
        ) {
            foreach ($response as $nr => $record) {
                if (
                    is_object($record) &&
                    property_exists($record, 'user')
                ) {
                    $record->user = (object) [
                        'uuid' => $record->user,
                        'email' => $user[$record->user->uuid]->getEmail(),
                    ];
                }
            }
        }
        return $response;
    }
}