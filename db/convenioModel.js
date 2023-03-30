const mongoose = require("mongoose");

// user schema
//"CÓDIGO ÓRGÃO CONCEDENTE";"NOME ÓRGÃO CONCEDENTE";"CÓDIGO UG CONCEDENTE";"NOME UG CONCEDENTE";"CÓDIGO CONVENENTE";"TIPO CONVENENTE";"NOME CONVENENTE";"TIPO ENTE CONVENENTE";"TIPO INSTRUMENTO";"VALOR CONVÊNIO";"VALOR LIBERADO";"DATA PUBLICAÇÃO";"DATA INÍCIO VIGÊNCIA";"DATA FINAL VIGÊNCIA";"VALOR CONTRAPARTIDA";"DATA ÚLTIMA LIBERAÇÃO";"VALOR ÚLTIMA LIBERAÇÃO"
const ConvenioSchema = new mongoose.Schema({
    ValorUltimaLiberacao: {
        type: String,
    },

    DataUltimaLiberacao: {
        type: String,
    },

    ValorContrapartida: {
        type: String,
    },

    DataFinalVigencia: {
        type: String,
    },

    DataInicioVigencia: {
        type: String,
    },

    DataPublicacao: {
        type: String,
    },
    
    ValorLiberado: {
        type: String,
    },
    
    ValorConvenio: {
        type: String,
    },
    
    TipoInstrumento: {
        type: String,
    },
    
    TipoEnteConvenente: {
        type: String,
    },
    
    TipoConvenente: {
        type: String,
    },
    
    NomeConvenente: {
        type: String,
    },
    
    CodigoConvenente: {
        type: String,
    },
    
    CondigoUgConcedente: {
        type: String,
    },

    NomeUgConcedente: {
        type: String,
    },

    CondigoOrgaoConcedente: {
        type: String,
    },

    NomeOrgaoConcedente: {
        type: String,
    },

    NomeOrgaoSuperior: {
        type: String,
    },

    CodigoOrgaoSuperior: {
        type: String,
    },

    ObjetoConvenio: {
        type: String,
    },


    NumeroProcessoConvenio: {
        type: String,
    },

    NumeroOriginal: {
        type: String,
    },

    SituacaoConvenio: {
        type: String,
    },

    NomeMunicipio: {
        type: String,
    },

    CodigoSiafiMunicipio: {
        type: String,
    },

    UF: {
        type: String,
    },
    NumeroConvenio: {
        type: String,
        unique: [true, "NumeroConvenio Exist"],
    },
    
    });

// export convenioSchema
module.exports = mongoose.model.Convenios || mongoose.model("Convenios", ConvenioSchema);
