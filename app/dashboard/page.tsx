import EmptyState from "@/components/ui/empty-state";
import AddNewButton from "@/features/dashboard/components/AddNewButton";
import AddRepoButton from "@/features/dashboard/components/AddRepoButton";
import React from "react";

const Page = () => {
  const playgrounds: any[] = [];
  return (
    <div className="flex flex-col justify-start items-center min-h-screen mx-auto max-w-7xl px-4 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <AddNewButton />
        <AddRepoButton />
      </div>
      <div className="mt-10 flex flex-col justify-center items-center w-full">
        {playgrounds && playgrounds.length === 0 ? (
          <EmptyState
            title="No Projects Found"
            description="Add a new project"
            imageSrc="/empty-state.svg"
          />
        ) : (
          // todo add playground state
          <p>Playgrounds Table</p>
        )}
      </div>
    </div>
  );
};

export default Page;
