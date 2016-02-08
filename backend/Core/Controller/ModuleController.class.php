<?php
class ModuleController extends Controller {
    public function Index(){
        if(!isset($_GET['name']) || !isset($_GET['callback'])){
            header("X-Info: name or callback required", true, 400);
            exit();
        }
        $name = $_GET['name'];
        $callback = $_GET['callback'];
        
        $path = realpath(dirname(dirname(__FILE__))."/../Modules/".$name.".js");
        
        if($path === FALSE){
            header("X-Info: module not found", true, 404);
            exit();
        }
        
        $jsContent = file_get_contents($path);
        $jsWrapper = "(function(){window['$callback']$jsContent;})();";
        header("Content-Type: text/javascript", true);
        echo $jsWrapper;
    }
}
