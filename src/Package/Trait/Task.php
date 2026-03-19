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
        if(!property_exists($options, 'text')){
            throw new Exception('Option text is missing');
        }
        if(
            property_exists($options, 'color') &&
            !property_exists($options->color, 'text')
        ){
            throw new Exception('Color text is missing');
        }
        if(
            property_exists($options, 'color') &&
            !property_exists($options->color, 'background')
        ){
            throw new Exception('Color background is missing');
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

    public function update($flags, $options): void
    {

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