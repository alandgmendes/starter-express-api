const mongoose = require("mongoose");

// program schema
const ProgramaSchema = new mongoose.Schema({
    
    
    DescricaoSubtipoPrograma: {
        type: String,
    },

    NomeSubtipoPrograma: {
        type: String,
    },

    AcaoOrcamentaria: {
        type: String,
    },
    
    UfPrograma: {
        type: String,
    },
    
    NaturezaJuridicaPrograma: {
        type: String,
    },
    
    ModalidadePrograma: {
        type: String,
    },

    DtProgFimBenefEsp: {
            type: String,
        },

    DtProgIniBenefEsp: {
        type: String,
    },

    DtProgFimEmendaPar: {
        type: String,
    },

    DtProgIniEmendaPar: {
        type: String,
    },

    DtProgFimRecebProp: {
        type: String,
    },

    DtProgIniRecebProp: {
        type: String,
    },

    AnoDisponibilizacao: {
        type: Number,
    },

    DataDisponibilizacao: {
        type: String,
    },

    SitPrograma: {
        type: String,
    },
    
    NomePrograma: {
        type: String,
    },
    
    CodPrograma: {
        type: String,
    },

    IdPrograma: {
        type: String,
    },

    DescOrgaoSupPrograma: {
        type: String,
    },

    CodOrgaoSupPrograma: {
        type: String,
    },
   
    });

// export programaSchema
module.exports = mongoose.model.programas || mongoose.model("programas", ProgramaSchema);
