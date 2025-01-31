import PrimaryButton from "./Button";

const Membership = () => {
  return (
    <section
      id="membership"
      className="py-16 px-6 bg-black text-white text-center"
    >
      <h2 className="text-4xl font-bold">Become a Member</h2>
      <p className="mt-4 text-gray-400">
        Join Cicada and be part of an incredible electronic music community.
      </p>
      <div className="my-4">
        <PrimaryButton label={"Join Us Now"} link={"/"} size="lg" />
      </div>
    </section>
  );
};

export default Membership;
