const api = require("./api");

module.exports = {
    attr1: "yo",
    attr2: 2,
    fct1: async function(){
        return await api.get();
    }

}