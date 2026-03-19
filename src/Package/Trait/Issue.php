<?php
namespace Package\Raxon\Issue\Trait;

use Exception;
use Raxon\Exception\ObjectException;
use Raxon\Node\Module\Node;

trait Issue {
    const NAME = 'Application.Issue';

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
        $create = [];
        $create['user'] = $options->user->uuid ?? null;
        $create['title'] = $options->title ?? null;
        $create['description'] = $options->description ?? [];
        $create['is'] = (object) [
            'created' => $time,
            'modified' => $time
        ];
        return $node->create($class, $role, $create, $options);
    }

    public function update($flags, $options): void
    {

    }

    public function delete($flags, $options): void
    {

    }

    /**
     * @throws ObjectException
     * @throws Exception
     */
    public function list($flags, $options): array
    {
        $object = $this->object();
        $node = new Node($object);
        $class = self::NAME;
        $role = $node->role_system();
        return $node->list($class, $role, $options);
    }
}