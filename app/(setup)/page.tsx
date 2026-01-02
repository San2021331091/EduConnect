import InitialModals from "@/components/modals/InitialModals";

const SetUpPage: React.FC = () => {
  const fakeUser = {
    profileId: "a1b2c3d4-5678-90ab-cdef-1234567890ab", // example UUID
  };

  return <InitialModals currentUser={fakeUser} />;
};

export default SetUpPage;
