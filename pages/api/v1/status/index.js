function status(request, response) {
  response.status(200).json({ msg: "esse é o /api/status" });
}

export default status;
