module.exports = {
  resultFormat: (ok, message, result) => {
    console.log(message);
    return {
      ok,
      error: message,
      result,
    };
  },
};
