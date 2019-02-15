return {
    rendering: function ($dom) {
        switch (QtnName) {
            case 'A1a_0':
                console.log(QtnName);
                break;
        }
    }, submit: function (valid) {
        switch (QtnName) {
            case 'A1a_0':
                valid[QtnName] = true;
                valid['A1a_0_1'] = false;
                valid['A1a_0_2'] = false;
                break;
        }
        return valid;
    }
}

