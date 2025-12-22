// import { updateUser } from '../../../lib/db' // updateUser not implemented

export default async function handler(req, res) {
  // updateUser is not implemented. Return 501 Not Implemented.
  res.status(501).json({ success: false, message: 'User update not implemented.' })
}
