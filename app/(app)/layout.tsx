import { Toaster } from "react-hot-toast";

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-poppins antialiased" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
