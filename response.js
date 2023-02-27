export const response = (status, values, res) => {
  const data = {
    'status': status,
    'value': values
  }
  
  res.status(data.status)
  res.json(data)
  res.end()
}