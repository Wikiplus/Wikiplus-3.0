<?php
class i18nController extends Controller {
    public function Index(){
        if(!isset($_GET['lang'])){
            header("X-Info: lang required", true, 400);
            exit();
        }
        $lang = $_GET['lang'];
        
        $path = realpath(dirname(dirname(__FILE__))."/../languages/".$lang.".json");
        
        if($path === FALSE){
            header("X-Info: languages file was not found", true, 404);
            exit();
        }
        
        $jsonContent = file_get_contents($path);
        header("Content-Type: application/json", true);
        header("Access-Control-Allow-Origin: *", true);
        header("Access-Control-Max-Age: 86400", true);
        echo $jsonContent;
    }
}