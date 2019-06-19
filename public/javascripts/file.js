var fs = require('fs');

var rt  = function () {
    var obj = {
        goods: [
            {
                id: 1,
                text: "Sourse text",
            }
        ]
    };


    var json = JSON.stringify(obj);

    window.addEventListener('load', function () {
        if(document.querySelector('.button-add')) {
            var but = document.querySelector('.button-add');

            but.addEventListener('click', function () {
                console.log('working');

                fs.writeFile('myjsonfile.json', json,function(err) {
                        if (err) throw err;
                        console.log('complete');
                    }
                );
            });
        }
    });
};



module.exports = rt;



