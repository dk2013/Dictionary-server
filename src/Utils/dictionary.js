const transformDictionaryFromDbToClient = (dictionaryObj) => {
  return {
    id: dictionaryObj._id,
    user_id: dictionaryObj.user_id,
    dictionary: dictionaryObj.dictionary,
  };
};

module.exports = { transformDictionaryFromDbToClient };
