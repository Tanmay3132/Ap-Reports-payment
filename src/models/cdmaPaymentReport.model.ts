import { ICDMAPaymentReport } from "@/interfaces/paymentReports.interface";
import { Document, model, Schema } from "mongoose";

const CDMAPaymentReport : Schema = new Schema({
    consumerid: String,
    ulbcode: String,
    service_code: String,
    rurl: String,
    dept_code: String,
    dept_transaction_id:String,
    amount: String,
    mobileno: String,
    email: String,
    heading_msg: String,
    body_message: String,
    image_link: String,
    others: Object,
    tr_billfetch_response: Object,
    tr_create_response: String,
    tr_payment_response: String,
    msg_payload: String,
    msg_wa_id: String,
    trans_status: String,
    callback_url: String,
    is_payment_status:Boolean,
    created_date: String,
    updated_date: String,
},
{timestamps:true, strict:false});

const CDMAServicePaymentReportModel = model<ICDMAPaymentReport & Document>('cdma_cfms_ap_gov_schemas', CDMAPaymentReport,'cdma_cfms_ap_gov_schemas');

export default CDMAServicePaymentReportModel;