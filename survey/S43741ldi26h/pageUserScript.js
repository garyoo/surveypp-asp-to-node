return {
    pageRendering: function (currentDomArray) {
        console.log(currentDomArray);
        switch (+PageNum) {
            case 10:
                console.log(PageNum);
                var questions = ["AQ4","AQ5","AQ6","AQ7","AQ8","AQ9"];
                for(var idx in questions) {
                    if (idx>0) {
                        $("div#survey-wrapper-"+ questions[idx]).hide();
                    }
                }

                $("input:radio[name='AQ4']").on('click', function () {
                    $("div#survey-wrapper-AQ5").show();
                });
                $("input:radio[name='AQ5']").on('click', function () {
                    $("div#survey-wrapper-AQ6").show();
                });
                $("input:radio[name='AQ6']").on('click', function () {
                    $("div#survey-wrapper-AQ7").show();
                });
                $("input:radio[name='AQ7']").on('click', function () {
                    $("div#survey-wrapper-AQ8").show();
                });
                $("input:radio[name='AQ8']").on('click', function () {
                    $("div#survey-wrapper-AQ9").show();
                });



                break;
        }
    },
    rendering: function ($dom) {
        switch (QtnName) {
            case 'SQ1':
            case 'SQ2':
            case 'SQ3':
            case 'SQ4':
            case 'SQ5':
                $dom.tableToMixTable();
                break;
            case 'AQ4':
            case 'AQ5':
            case 'AQ6':
            case 'AQ7':
            case 'AQ8':


        }
    }, submit: function (valid) {
        switch (QtnName) {
            case 'SQ1_1':
                valid['SQ1_1_1'] = false;
                break;
            case 'B11_1a':
            case 'B12':
            case 'B13':
                valid[QtnName] = false;
                break;
            case 'B17_1':
                valid['B17_1_1'] = false;
                break;
            case 'B17_2':
                valid['B17_2_1'] = false;
                break;
            case 'B18':
                valid['B18_1'] = false;
                valid['B18_2'] = false;
                valid['B18_3'] = true;
                valid['B18_4'] = false;
                valid['B18_5'] = false;
                valid['B18_6'] = false;
                valid['B18_7'] = true;
                break;
        }
        return valid;
    }
}

