<?php
namespace Package\Raxon\Issue\Trait;

use Exception;
use Raxon\Exception\ObjectException;
use Raxon\Node\Module\Node;

trait Issue {
    const NAME = 'Issue';

    /**
     * @throws ObjectException
     * @throws Exception
     */
    public function create($flags, $options): void
    {
        $object = $this->object();
        $node = new Node($object);
        $class = 'Application.Issue';
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
        $response = $node->create($class, $role, $create, $options);
        d($response);
    }

    public function update($flags, $options): void
    {

    }

    public function delete($flags, $options): void
    {

    }

    public function list($flags, $options): void
    {

    }
}