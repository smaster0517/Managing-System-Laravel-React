<?php

namespace App\Traits;

trait DownloadResource
{

    /**
     * Download Resource
     * 
     * @param string $filename
     * @return \Illuminate\Http\Response
     */
    abstract public function download(string $filename, $identifier);
}
