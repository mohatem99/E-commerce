export const deleteFromDb = async (req, res, next) => {
  if (req?.data) {
    await req.data.model.findById(req.data.id);
  }
};
