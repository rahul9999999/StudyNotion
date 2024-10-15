
import toast from "react-hot-toast"
import { apiConnector } from "../apiConnecter"
import { studentEndpoints } from "../apis"
import rzplogo from "../../assets/Images/rzp.png";
import { resetCart } from "../../slices/cartSlice";




const { COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API } = studentEndpoints

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = src

    script.onload = () => {
      resolve(true)
    }

    script.onerror = () => {
      resolve(false)
    }

    document.body.appendChild(script)
  })
}

export const buyCourse = async (courses, token, userDetails, navigate, dispatch) => {
  const toastId = toast.loading("Please wait while we redirect you to payment gateway", {
    position: "bottom-center",
    autoClose: false,
  });

  try {
    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
    console.log("res", res)

    if (!res) {
      toast.error("RozorPay loading failed")
      return
    }

    const paymentIniciate = await apiConnector("POST", COURSE_PAYMENT_API, { courses }, {
      Authorisation: `Bearer ${token}`,
    })

    console.log("paymentIniciate", paymentIniciate)

    const options = {
      key: process.env.RAZORPAY_KEY,
      amount: paymentIniciate.data.amount,
      currency: 'INR',
      name: "Study Notion",
      description: "Thank you for purchasing the course",
      order_id: paymentIniciate.data.orderId,
      image: rzplogo,
      prefill: {
        name: userDetails?.firstName + " " + userDetails?.lastName,
        email: userDetails?.email,
      },
      handler: async function (response) {
        console.log("buyCourse -> response", response)
        sendPaymentSuccessEmail(response,paymentIniciate.data.amount,token);
        verifypament(response,courses,token,navigate,dispatch);
      },
      theme: {
        color: '#F37254'
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open()

    paymentObject.on("paymrnt faild", function () {
      toast.error("Payment failed")
    })

    toast.dismiss(toastId)
  } catch (error) {
    toast.dismiss(toastId);
    toast.error("Something went wrong");
    console.log("buyCourse -> error", error)
  }

}

const sendPaymentSuccessEmail = async (response, amount, token) => {
  const res = await apiConnector("POST", SEND_PAYMENT_SUCCESS_EMAIL_API, {
    amount,
    paymentId: response.razorpay_payment_id,
    orderId: response.razorpay_order_id,
  }, {
    Authorisation: `Bearer ${token}`,
  })

  if (!res.success) {
    console.log(res.message);
    toast.error(res.message);
}
}

const verifypament = async(response,courses,token,navigate,dispatch) => {
  console.log("courses",courses)
  const toastId = toast.loading("Please wait while we verify your payment");

  try{
    const res = await apiConnector("POST",COURSE_VERIFY_API,{
      razorpay_payment_id:response.razorpay_payment_id,
      razorpay_order_id:response.razorpay_order_id,
      razorpay_signature:response.razorpay_signature,
      courses:courses
    },{Authorisation:`Bearer ${token}`})
  
    if(!res.data.success){
      toast.error(res.message)
      return
    }

    toast.success("Payment Successfull");
    navigate("/dashboard/enrolled-courses");
    dispatch(resetCart())
  }catch(error){
        toast.error("Payment Failed");
        console.log(error);
  }

  toast.dismiss(toastId)

}