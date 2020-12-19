module.exports = (func) => {
  return (req, res, next) => {
    func(req, res, next).catch(next);
  };
};

//next(err)
//trigger app.use(err,...) => return Error object in terminal

//next
//not trigger app.use(err,...) => return Error object in terminal
