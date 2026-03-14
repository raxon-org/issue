<?php
namespace Package\Raxon\Issue\Trait;

trait Issue {
    const NAME = 'Issue';

    public function create($flags, $options): void
    {
        $object = $this->object();
        d($options);
        //user uuid
        //title
        //description
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