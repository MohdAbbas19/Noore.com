import { db } from "hatchable";

export const access="member"; export const methods=["GET"]; export default async function(req,res){const o=await db.query("SELECT id,order_number,total,payment_method,payment_status,order_status,created_at FROM store_orders WHERE user_id=$1 ORDER BY created_at DESC",[req.member.id]);res.json(o.rows)}