({
    "manifest": {
        "name": "test",
        "version": "0.0.2",
        "dependencies": ['sora', 'diu']
    },
    "init": function(self, dpds){
        console.log("Hello! I'm test.");
        return true;
    }
})