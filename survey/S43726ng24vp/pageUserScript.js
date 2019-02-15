return {
    rendering: function ($dom) {
        switch (QtnName) {
            case 'SQ1_1':
            case 'SQ1_2':
            case 'SQ1_3':
            case 'SQ1_4':
            case 'SQ1_5':
            case 'SQ2':
            case 'SQ3':
                $dom.tableToMixTable();
                break;
            case 'A1_1':
            case 'A1_2':
            case 'A1_3':
            case 'A1_4':
            case 'A1_5':
            case 'A1_6':
            case 'A1_7':
            case 'A1_7_2':
            case 'A1_7_3':
            case 'A1_7_4':
            case 'A1_7_5':
            case 'A1_7_6':
                $dom.tableToMixTable();
                break;
            case 'A3_1':
            case 'A3_2':
            case 'A3_3a':
            case 'A3_3b':
            case 'A3_4':
            case 'A3_5':
            case 'A3_6':
            case 'A3_7':
                $dom.tableToMixTable();
                break;
            case 'A4':
                break;
            case 'A5_1a':
            case 'A5_1b':
            case 'A5_2a':
            case 'A5_2b':
                $dom.tableToMixTable();
                break;
            case 'B17_1':
            case 'B17_2':
                $dom.tableToMixTable();
                break;
            case 'C1_1':
            case 'C1_2':
            case 'C1_3':
                $dom.tableToMixTable();
                break;
            case 'D5a':
            case 'D5b':
            case 'D5c':
            case 'D5d':
            case 'D5e':
            case 'D5f':
                $dom.tableToMixTable();
                break;
            case 'D6a':
            case 'D6b':
            case 'D6c':
            case 'D6d':
            case 'D6e':
            case 'D6f':
                $dom.tableToMixTable();
                break;
            case 'DQ1_1':
            case 'DQ1_2':
            case 'DQ1_3':
                $dom.tableToMixTable();
                break;
            case "DQ2":
                break;
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

