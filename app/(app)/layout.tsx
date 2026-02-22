import AppRuntime from "@/components/layouts/AppRuntime";


const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className="font-poppins antialiased">
        {children}
        <AppRuntime />
      </body>
    </html>
  );
};

export default RootLayout;
