<?php
namespace Package\Raxon\Issue\Trait;

use Exception;
use Raxon\Exception\ObjectException;
use Raxon\Node\Module\Node;

trait Task {
    const NAME = 'Application.Issue.Task';
    const STATUS_OPEN = 'open';
    const STATUS_CLOSED = 'closed';
    const STATUS_PROCESSING = 'processing';

    /**
     * @throws ObjectException
     * @throws Exception
     */
    public function create($flags, $options): false|array
    {
        $object = $this->object();
        $node = new Node($object);
        $class = self::NAME;
        $role = $node->role_system();

        $time = microtime(true);
        if(!property_exists($options, 'description')){
            throw new Exception('Option description is missing');
        }
        if(!is_array($options->description)){
            throw new Exception('Option description is not an array');
        }
        $create = [];
        $create['description'] = $options->description ?? [];
        $create['is'] = (object) [
            'created' => $time,
            'modified' => $time
        ];
        $create['status'] = $options->status ?? self::STATUS_OPEN;
        return $node->create($class, $role, $create, $options);
    }

    /**
     * @throws ObjectException
     * @throws Exception
     */
    public function patch($flags, $options): void
    {
        $object = $this->object();
        $node = new Node($object);
        $class = self::NAME;
        $role = $node->role_system();

        $time = microtime(true);
        if(!property_exists($options, 'uuid')){
            throw new Exception('Option uuid is missing');
        }
        if(
            property_exists($options, 'description') &&
            !is_array($options->description)
        ){
            throw new Exception('Option description is not an array');
        }
        $response = $node->record($class, $role, [
            'where' => [
                [
                    'value' => $options->uuid,
                    'attribute' => 'uuid',
                    'operator' => '==='
                ]
            ]
        ]);
        ddd($response);

        /*
        $create = [];
        $create['description'] = $options->description ?? [];
        $create['is'] = (object) [
            'created' => $time,
            'modified' => $time
        ];
        $create['status'] = $options->status ?? self::STATUS_OPEN;
        return $node->create($class, $role, $create, $options);
        */
    }

    public function delete($flags, $options): void
    {

    }

    public function list($flags, $options): array
    {
        $object = $this->object();
        $node = new Node($object);
        $class = self::NAME;
        $role = $node->role_system();
        return $node->list($class, $role, $options);
    }
}