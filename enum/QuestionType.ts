export enum QuestionType {
    Description = 10,       //지시문
    SingleDefault = 11,     //단일 기본형
    SinglePopup = 12,       //단일 팝업형
    SingleMeasure = 13,     //단일 척도형
    SingleDropDown = 14,    //단일 선택형(dropdown)
    SingleBPTO = 15,        //BPTO
    SingleSearch = 16,      //단일 검색형
    SingleImageMap = 17,    //단일 이미지 매핑?
    SingleMaxDiff = 18,     //단일 MAX DIFF

    MultiSelection = 21,     //다중 선택형
    MultiSearch = 26,       //다중 검색형
    MultiImageClickable = 27,   //다중 이미지 클릭커블?

    RankSelection = 31,     //순위 선택형
    RankSearch = 36,        //순위 검색형
    RankImageClickable = 37,//순위 이미지 클릭커블?

    NumberDefault = 41,     //숫자 기본형
    NumberSum = 42,         //숫자 비율(합계)형
    NumberUnitConvert = 43, //숫자 단위환산형
    TextSingle = 51,        //주관식 단일형
    TextMulti = 52,         //주관식 다중형
    TextCoding = 53,        //주관식 코딩형
    TextMobileNumber = 54,  //54	기타 휴대폰번호 입력형
    TableSingle = 61,       //테이블 단일형
    TableSingleBoth = 63,   //테이블 단일형-좌우대칭
    TableSingleTransform = 65,  //테이블 단일형-행렬전환
    TableSingleSideBySide = 67, //테이블 단일형-SideBySide

    TableMulti= 62,              //테이블 다중형
    TableMultiBoth = 64,         //테이블 다중형-좌우대칭
    TableMultiTransform = 66,   //테이블 다중형-행렬전환
    TableMultiSideBySide = 68,  //테이블 다중형-SideBySide

    TableRankSelection = 69,    //테이블 순위형
    TableNumber = 75,           //테이블 숫자입력형
    TableNumberTransform = 76,  //테이블 숫자입력 행렬전환형

    VideoDisplay = 71,      //동영상
    ImageDisplay = 72,      //이미지형

    SliderSingleMeasure = 81,    //슬라이더-단일척도형
    SliderTableSingle = 82,     //슬라이더-테이블단일형
    SliderTableSingleVideo = 83,    //슬라이더-테이블동영상제시형

    UserCustom = 85,        //사용자 정의형

    Hidden = 91,            //숨김문항
    RandomQuestion = 92,    //랜덤문항

    AddressSearch = 93,     //주소검색
    Geo = 94,               //위치정보(위경도)
    FileUploadByPHP = 95,   //파일 업로드(php 기반)
    FileUploadByASP = 96,   //파일 업로드(asp, Flash 기반)

    TerminateCheck = 995,    // 탈락 이유 설명
    Terminate = 996,        //탈락
    QuotaCheck = 997,       //쿼터 췌크
    QuotaOver = 998,        //쿼터 오버
    End = 999,              //마무리
}

export enum SingleMeasureEDP {
    Value = 1,
    NoValue = 2,
    ValueAndArrow = 3,
    NoValueAndArrow = 4
}

export enum TableEDP {
    AllDisplay = 10,
    StepByStep = 30,
    StepByStepWithIntervalTime = 30,
    DefaultAllDisplay = 11,
    RandomAllDisplay = 12,
    RotationAllDisplay = 13,
    DefaultStepByStep = 21,
    RandomStepByStep = 22,
    RotationStepByStep = 23,
    DefaultStepByStepNextBtn = 31,
    RandomStepByStepNextBtn = 32,
    RotationStepByStepNextBtn = 33,
}

export enum NextModule {
    Terminate = "#Sout",
    Complete = "#Cout",
}


/*

81
82	슬라이더-테이블단일형
83	슬라이더-테이블동영상제시형
85	사용자정의문항


93	주소검색
94	위치정보(위경도)
95	파일 업로드(php 기반)1
96	파일 업로드(asp, Flash 기반)
*/