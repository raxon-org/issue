<?php
namespace Package\Raxon\Issue\Trait;

use Exception;
use Raxon\Exception\ObjectException;
use Raxon\Node\Module\Node;

trait Label {
    const NAME = 'Issue';

    /**
     * @throws ObjectException
     * @throws Exception
     */
    public function create($flags, $options): void
    {
        $object = $this->object();
        $node = new Node($object);
        $class = 'Application.Issue.Label';
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
        $create['text'] = $options->text ?? null;
        $create['color'] = $options->color ?? (object) ['text' => 'rgba(0,0,0,0.54)', 'background' => 'rgba(255, 255, 255, 0.8)'];
        $create['is'] = (object) [
            'created' => $time,
            'modified' => $time
        ];
        d($create);
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
        $object = $this->object();
        $node = new Node($object);
        $class = 'Application.Issue.Label';
        $role = $node->role_system();
        $response = $node->list($class, $role, $options);
        d($response);
    }
}