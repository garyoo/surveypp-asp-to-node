module.exports = [
    {request: '', template: 'index'},
    {request: 'index', template: 'index'},
    {request: 'error', template: 'error'},
    {request: 'router', template: 'router', async: true},
    {request: 'quota', template: 'quota',auth: true},
    {request: 'quotaDist', template: 'quotaDist',auth: true},
    {request: 'quotaPublic', template: 'quotaPublic'},
    {request: 'quotaView', template: 'quotaView', async: true},
    {request: 'login', template: 'login', async: true},
    {request: 'report', template: 'report',auth: true},
    {request: 'fieldWorkView', template: 'fieldWorkView', auth: true, async: true, mssql: true},
];