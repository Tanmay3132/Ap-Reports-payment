export interface IPaymentReport {
  _id?: string;
  department: string;
  service: string;
  status: 'Success' | 'Pending' | 'Failed';
  amount: string;
  transactionId: string;
  departmentTransactionId: string;
  mobile: string;
  orderId?: string;
  referenceId?: string;
  type: string;
  initiatedOn: string;
  completedOn: string;
}

export interface IRevenueServicePaymentReport {
  _id: string;
  amount: number;
  servicename: string;
  transactionid: string;
  message_body: string;
  transactionid_payment: string;
  mobileno: string;
  wabanumber: string;
  return_url: string;
  metadata: object;
  merchantid: string;
  orderid: string;
  reference_id: string;
  response_payload: string;
  payment_status: string | null;
  order_send_msg_id: string;
  refund_status: null;
  status_msg_id: null;
  is_msg_sent: boolean;
  createdate: string | object;
  updated_date: string;
}

export interface ICDMAPaymentReport {
  _id: string;
  consumerid: string;
  ulbcode: string;
  service_code: string;
  rurl: string;
  dept_code: string;
  dept_transaction_id: string;
  amount: string;
  mobileno: string;
  email: string;
  heading_msg: string;
  body_message: string;
  image_link: string;
  others: object;
  tr_billfetch_response: object;
  tr_create_response: {
    [key: string]: any;
  };
  tr_payment_response: string;
  msg_payload: string;
  msg_wa_id: string;
  trans_status: string;
  callback_url: string;
  is_payment_status: boolean;
  created_date: string | object;
  updated_date: string;
}
