export const metadata = {
  title: "Payment Canceled | Cicada Music Society",
  description: "Your payment was canceled. You can try again when you're ready.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function FailureLayout({ children }) {
  return <>{children}</>;
}

