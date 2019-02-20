module.exports =  (() => {
    //let fs = require('fs');
    //let apiPath = require('path').join(__dirname,'../','api');
    //let apiFiles = fs.readdirSync(require('path').join(__dirname,'../','api')).map(f => `${require('path').join(apiPath, f)}`);
    return {
        swaggerDefinition: {
            info: {
                title: 'surveypp-asp-to-node API',
                version: '1.0.0',
                description: 'surveypp API',
            },
            produces: ["application/json","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.ms-excel","text/csv"],
            host: 'localhost:3000',
            basePath: '/api',
            contact: {
                email: 'hsyoo@surveypp.com'
            },
            components: {
                res: {
                    BadRequest: {
                        description: '잘못된 요청.',
                        schema: {
                            $ref: '#/components/errorResult/Error'
                        }
                    },
                    Forbidden: {
                        description: '권한이 없슴.',
                        schema: {
                            $ref: '#/components/errorResult/Error'
                        }
                    },
                    NotFound: {
                        description: '없는 리소스 요청.',
                        schema: {
                            $ref: '#/components/errorResult/Error'
                        }
                    }
                }
            },
            errorResult: {
                Error: {
                    type: 'object',
                    properties: {
                        errMsg: {
                            type: 'string',
                            description: '에러 메시지 전달.'
                        }
                    }
                }
            },
            schemes: ['http','https'],
            definitions: {
                'setQuotaParams': {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string'
                        },
                        value: {
                            type: 'string'
                        },
                        cnt: {
                            type: 'number'
                        },
                    }
                }
            },
            paths: {
                "/getAnswered" : {
                    "post": {
                        "x-swagger-router-controller": "getAnswered",
                        "operationId": "getAnswered",
                        "tags": ["api"],
                        "description": "응답값 가져오기",
                        "parameters": [
                            { "name": "projectID", "in": "formData", "type": "string", "required": true, "description": "프로젝트 아이디(PID)", "default": "S43208nfmx6x"},
                            { "name": "responseID", "in": "formData","type": "string", "required": true,  "description": "응답자 아이디"},
                            { "name": "groupID", "in": "formData", "type": "string","required": true, "description": "그룹 아이디"}
                        ],
                        "responses": {
                            "200": {"description": "정상"}
                        }
                    }
                },
                "/getAuth": {
                        "post": {
                            "x-swagger-router-controller": "getAuth",
                            "operationId": "getAuth",
                            "tags": ["api"],
                            "parameters": [
                                {"name": "projectID", "in": "formData", "type": "string", "required": true,"description": "프로젝트 아이디(PID)", "default": "S43208nfmx6x"},
                                { "name": "authKey", "in": "formData","type": "string" , "default": "8q1jh"},
                                { "name": "token", "in": "formData", "type": "string"},
                                { "name": "mode", "in": "formData", "type": "string", enum:['file','db'], "description": "기본값은 FILE"},
                            ],
                            "description": "인증이 필요한 경우",
                            "responses": {
                                "200": {"description": "정상"}
                            }
                        }
                },
                "/getConfig": {
                    "post": {
                        "x-swagger-router-controller": "getConfig",
                        "operationId": "getConfig",
                        "tags": ["api"],
                        "description": "설정값 불러오기",
                        "parameters": [
                            {"name": "projectID", "in": "formData", "type": "string", "required": true,"description": "프로젝트 아이디(PID)", "default": "S43208nfmx6x"},
                            {"name": "mode", "in": "formData", "type": "string", enum:['file','db'], "description": "기본값은 FILE"},
                        ],
                        "responses": {
                            "200": {"description": "정상"}
                        }
                    }
                },
                "/getInfoByObjectID": {
                    "post": {
                        "x-swagger-router-controller": "getInfoByObjectID",
                        "operationId": "getInfoByObjectID",
                        "tags": ["api"],
                        "description": "OBJECT ID로 응답값 찾기",
                        "parameters": [
                            {"name": "objectID", "in": "formData", "type": "string", "required": true,"description": "OBJECT ID(mongo)"}
                        ],
                        "responses": {
                            "200": {"description": "정상"}
                        }
                    }
                },
                "/getQuestions": {
                    "post": {
                        "x-swagger-router-controller": "getQuestions",
                        "operationId": "getQuestions",
                        "tags": ["api"],
                        "description": "QUESTION REQUEST",
                        "parameters": [
                            {"name": "projectID", "in": "formData", "type": "string", "required": true,"description": "프로젝트 아이디(PID)", "default": "S43208nfmx6x"},
                            { "name": "mode", "in": "formData", "type": "string", enum:['file','db'], "description": "기본값은 FILE"},
                        ],
                        "responses": {
                            "200": {"description": "정상"}
                        }
                    }
                },
                "/getQuota": {
                    "post": {
                        "x-swagger-router-controller": "getQuota",
                        "operationId": "getQuota",
                        "tags": ["api"],
                        "description": "QUOTA REQUEST",
                        "parameters": [
                            {"name": "projectID", "in": "formData", "type": "string", "required": true,"description": "프로젝트 아이디(PID)", "default": "S43208nfmx6x"},
                        ],
                        "responses": {
                            "200": {"description": "정상"}
                        }
                    }
                },
                "/getQuotaDist": {
                    "post": {
                        "x-swagger-router-controller": "getQuotaDist",
                        "operationId": "getQuotaDist",
                        "tags": ["api"],
                        "description": "QUOTA 배포 링크 설정",
                        "parameters": [
                            {"name": "projectID", "in": "formData", "type": "string", "required": true,"description": "프로젝트 아이디(PID)", "default": "S43208nfmx6x"},
                            {"name": "_ids", "in": "formData", "type": "array", "required": true, "desction": "OBJECT IDS"}
                        ],
                        "responses": {
                            "200": {"description": "정상"}
                        }
                    }
                },
                "/getQuotaCnt": {
                    "post": {
                        "x-swagger-router-controller": "getQuotaCnt",
                        "operationId": "getQuotaCnt",
                        "tags": ["api"],
                        "description": "쿼터 카운트 요청",
                        "parameters": [
                            {"name": "projectID", "in": "formData", "type": "string", "required": true,"description": "프로젝트 아이디(PID)", "default": "S43208nfmx6x"},
                            {"name": "questions", "in": "formData", "type": "array", "required": true, "description": "쿼터 문항", "items":{"type": "string"}}
                        ],
                        "responses": {
                            "200": {"description": "정상"}
                        }
                    }
                },
                "/getQuotaCntSpecific": {
                    "post": {
                        "x-swagger-router-controller": "getQuotaCntSpecific",
                        "operationId": "getQuotaCntSpecific",
                        "tags": ["api"],
                        "description": "쿼터 카운팅 개별 요청",
                        "parameters": [
                            {"name": "projectID", "in": "formData", "type": "string", "required": true,"description": "프로젝트 아이디(PID)", "default": "S43208nfmx6x"},
                            {"name": "questions", "in": "formData", "type": "array", "required": true, "description": "쿼터 문항",
                                "items":{"type": "object"},
                                "properties": {"key": {"type": "string", "description": "문항 번호"}, "value":{"type": "string","description": "쿼터 값"}}
                            }
                        ],
                        "responses": {
                            "200": {"description": "정상"}
                        }
                    }
                },
                "/getSurvey": {
                    "post": {
                        "x-swagger-router-controller": "getSurvey",
                        "operationId": "getSurvey",
                        "tags": ["api"],
                        "description": "설문 셋업",
                        "parameters": [
                            {"name": "projectID", "in": "formData", "type": "string", "required": true,"description": "프로젝트 아이디(PID)", "default": "S43208nfmx6x"},
                            {"name": "responseID", "in": "formData", "type": "string", "required": true, "description": "응답자 ID"},
                            {"name": "groupID", "in": "formData", "type": "string", "required": true, "description": "그룹 ID"},
                            { "name": "mode", "in": "formData", "type": "string", enum:['file','db'], "description": "기본값은 FILE"},
                        ],
                        "responses": {
                            "200": {"description": "정상"}
                        }
                    }
                },
                "/getSurveyData": {
                    "get": {
                        "x-swagger-router-controller": "getSurveyData",
                        "operationId": "getSurveyData",
                        "tags": ["api"],
                        "description": "설문 데이터 다운로드 받기",
                        "parameters": [
                            {"name": "projectID", "in": "query", "type": "string", "required": true,"description": "프로젝트 아이디(PID)", "default": "S43726ng24vp"},
                            {"name": "status", "in": "query", "type": "string", "description": "완료자 여부", enum: ['complete',undefined]},
                            {"name": "fileType", "in": "query", "type": "string", enum:['xlsx','xls','csv'], "description": "엑셀 타입"},
                            {"name": "mode", "in": "query", "type": "string", enum:['file','db'], "description": "기본값은 FILE"},
                        ],
                        "responses": {
                            "200": {"description": "정상"}
                        }
                    }
                },
                "/makeQuestionJSON": {
                    "post": {
                        "x-swagger-router-controller": "makeQuestionJSON",
                        "operationId": "makeQuestionJSON",
                        "tags": ["api"],
                        "description": "로컬 DB에 있는 설문 데이터를 JSON 파일로 저장",
                        "parameters": [
                            {"name": "projectID", "in": "formData", "type": "string", "required": true,"description": "프로젝트 아이디(PID)", "default": "S43208nfmx6x"},
                        ],
                        "responses": {
                            "200": {"description": "정상"}
                        }
                    }
                },
                "/removeQuota": {
                    "post": {
                        "x-swagger-router-controller": "removeQuota",
                        "operationId": "removeQuota",
                        "tags": ["api"],
                        "description": "쿼터 문항 제거",
                        "parameters": [
                            {"name": "projectID", "in": "formData", "type": "string", "required": true,"description": "프로젝트 아이디(PID)", "default": "S43208nfmx6x"},
                            {"name": "objectID", "in": "formData", "type": "string", "required": true,"description": "OBJECT ID", "default": ""},
                        ],
                        "responses": {
                            "200": {"description": "정상"}
                        }
                    }
                },
                "/setQuota": {
                    "post": {
                        "x-swagger-router-controller": "setQuota",
                        "operationId": "setQuota",
                        "tags": ["api"],
                        "description": "쿼터 문항 설정",
                        "parameters": [
                            {"name": "projectID", "in": "formData", "type": "string", "required": true,"description": "프로젝트 아이디(PID)", "default": "S43746h7f20m"},
                            {"name": "quota", "in": "formData", "type": "array", "required": true,"description": "쿼터 문항", "default": ["S4"], "items":{"type": "string"}},
                            {"name": "quotaValues", "in": "formData", "type": "array", "required": true,"description": "OBJECT ID", "items": {"$ref": "#/definitions/setQuotaParams"}},
                        ],
                        "responses": {
                            "200": {"description": "정상"}
                        }
                    }
                },
                "/setStatus": {
                    "post": {
                        "x-swagger-router-controller": "setStatus",
                        "operationId": "setStatus",
                        "tags": ["api"],
                        "parameters": [
                            {"name": "projectID", "in": "formData", "type": "string", "required": true,"description": "프로젝트 아이디(PID)", "default": "S43208nfmx6x"},
                            {"name": "objectID", "in": "formData","type": "string" , "required": true, "description": "OBJECT ID(mongo DB)"},
                            {"name": "responseID", "in": "formData", "type": "string", "required": true, "description": "응답자 아이디"},
                            {"name": "groupID", "in": "formData", "type": "string", "required": true, "description": "그룹 아이디"},
                            {"name": "status", "in": "formData", "type": "number", "required": true, "description": "상태 값", enums: [996,998,999]},
                        ],
                        "description": "응답자 상태값 설정(탈락, 완료, 쿼터 오버)",
                        "responses": {
                            "200": {"description": "정상"}
                        }
                    }
                },
                "/setSurveyData": {
                    "post": {
                        "x-swagger-router-controller": "setSurveyData",
                        "operationId": "setSurveyData",
                        "tags": ["api"],
                        "parameters": [
                            {"name": "projectID", "in": "formData", "type": "string", "required": true,"description": "프로젝트 아이디(PID)", "default": "S43208nfmx6x"},
                            {"name": "objectID", "in": "formData","type": "string" , "required": true, "description": "OBJECT ID(mongo DB)"},
                        ],
                        "description": "설문 데이터 저장",
                        "responses": {
                            "200": {"description": "정상"}
                        }
                    }
                },
                "/setSurveyPrev": {
                    "post": {
                        "x-swagger-router-controller": "setSurveyPrev",
                        "operationId": "setSurveyPrev",
                        "tags": ["api"],
                        "parameters": [
                            {"name": "projectID", "in": "formData", "type": "string", "required": true,"description": "프로젝트 아이디(PID)", "default": "S43208nfmx6x"},
                            {"name": "objectID", "in": "formData","type": "string" , "required": true, "description": "OBJECT ID(mongo DB)"},
                            {"name": "currentQuestions", "in": "formData","type": "array" , "required": true, "description": "뒤로 가기 현재 문항"},
                        ],
                        "description": "설문 뒤로 가기",
                        "responses": {
                            "200": {"description": "정상"}
                        }
                    }
                }
            }
        },
        apis: ['../api/*.js']
    }
})();