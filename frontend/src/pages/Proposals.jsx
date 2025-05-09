import CreatePost from "@/components/custom/CreatePost";
import TabsWithLoader from "@/components/custom/TabsWithLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthContext } from "@/context/AuthContext";
import { serverAxiosInstance } from "@/utilities/config";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { set } from "date-fns";
import { ClockAlert, PlusCircle, Search, Users } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";



// TODO: Add filter for proposals based on the user's skills and interests, as well as the proposal's status (open, closed, etc.), and some common filters like "recent", "popular", etc.

const Proposals = () => {
  const { getCurrAuth } = useContext(AuthContext);
  const currUser = getCurrAuth();
  const currUserId = currUser.id ?? currUser._id;

  const navigate = useNavigate();


  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [needsReload, setNeedsReload] = useState(0);

  const [allProposals, setAllProposals] = useState([]);
  const [allFilteredProposals, setAllFilteredProposals] = useState([]);

  const [allSavedProposals, setAllSavedProposals] = useState([]);
  const [allSavedFilteredProposals, setAllSavedFilteredProposals] = useState([]);

  const [allAppliedProposals, setAllAppliedProposals] = useState([]);
  const [allAppliedFilteredProposals, setAllAppliedFilteredProposals] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");




  useEffect(() => {
    if (Object.keys(currUser).length > 0) {
      if (!currUser?.about) {
        toast.error("Incomplete Profile", {
          description: "You need to complete your profile to access all features",
          duration: 5000,
        });
        navigate("/user/profile");
      }
    }
  }, [currUser, navigate]);


  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() === "") {
      setAllFilteredProposals(allProposals);
      setAllAppliedFilteredProposals(allAppliedProposals);
      setAllSavedFilteredProposals(allSavedProposals);
    } else {
      const filteredProposals = allProposals.filter(proposal =>
        proposal.proposalTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.proposalDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.skillsRequired.some(skill => skill?.skill?.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      const filteredSavedProposals = allSavedProposals.filter(proposal =>
        proposal.proposalTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.proposalDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.skillsRequired.some(skill => skill?.skill?.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      const filteredAppliedProposals = allAppliedProposals.filter(proposal =>
        proposal.proposalTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.proposalDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proposal.skillsRequired.some(skill => skill?.skill?.toLowerCase().includes(searchQuery.toLowerCase()))
      );


      setAllFilteredProposals(filteredProposals);
      setAllAppliedFilteredProposals(filteredAppliedProposals);
      setAllSavedFilteredProposals(filteredSavedProposals);
    }
    setIsLoading(true);
    setIsLoading(false);
  }



  // Fetch all proposals from the server on page load
  useEffect(() => {
    setIsLoading(true);
    const fetchAllProposals = async () => {
      try {
        await serverAxiosInstance
          .get("/user/proposals")
          .then((response) => {
            if (response.status === 200) {
              console.log("Fetched Proposals: ", response.data);
              // Filter proposals based on the user's skills and interests



              const proposals = response.data.foundProposals.filter((proposal) =>
                proposal.proposalStatus === "open" && proposal.applicationDeadline > new Date().toISOString()
              );
              const savedProposals = response.data.savedProposals.filter((proposal) => {
                return proposal.proposalStatus === "open" && proposal.applicationDeadline > new Date().toISOString()
              });
              setAllSavedProposals(savedProposals);
              setAllSavedFilteredProposals(savedProposals);

              setAllProposals(proposals);
              setAllFilteredProposals(proposals);

              setAllAppliedProposals(
                proposals.filter((proposal) =>
                  proposal.applicants.some((applicant) => applicant?.applicant?._id === currUserId)
                )
              );
              setAllAppliedFilteredProposals(
                proposals.filter((proposal) =>
                  proposal.applicants.some((applicant) => applicant?.applicant?._id === currUserId)
                )
              );
            }
            setIsLoading(false);
            setIsDisabled(false);
          })
          .catch((error) => {
            toast.error("Error fetching proposals: " + error.message);
            setIsLoading(false);
          });
      } catch (error) {
        console.error("Error fetching proposals:", error);
      }
    };
    fetchAllProposals();
  }, [needsReload, currUserId]);


  // TODO: Features to be added: review edit, view, create options, remove unnecessary console logs, add loading states, add error handling, add success messages, add filters for proposals based on the user's skills and interests, as well as the proposal's status (open, closed, etc.), and some common filters like "recent", "popular", etc.


  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl h-[82vh] flex flex-1">
      <div className="flex flex-col md:flex-row gap-6 flex-1 h-full">
        {/* sidebar */}
        <div className="w-full md:w-64 space-y-6">
          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex flex-col items-center justify-evenly space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for proposals..."
                  className="pl-8"
                  disabled={isDisabled || isLoading}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                disabled={isDisabled || isLoading}
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <h3 className="text-lg font-bold">Filters</h3>
              <div className="space-y-1">
                <Button
                  // variant={activeFilter === "all" ? "default" : "ghost"}
                  className="w-full justify-start"
                  disabled={isDisabled || isLoading}
                  onClick={(e) => { e.preventDefault(); setAllFilteredProposals(allProposals); setSearchQuery(""); }}
                >
                  <Users className="mr-2 h-4 w-4" />
                  All Proposals
                </Button>
                <Button
                  className="w-full justify-start"
                  disabled={isDisabled || isLoading}
                  onClick={(e) => {
                    e.preventDefault(); setAllFilteredProposals(allProposals.toSorted(
                      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                    )); setSearchQuery("");
                  }}
                >
                  <ClockAlert className="mr-2 h-4 w-4" />
                  Recent Proposals
                </Button>
              </div>
            </div>
            <Separator />
            <Dialog
            // open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}
            >
              <DialogTrigger asChild>
                <Button className="w-full" disabled={isDisabled || isLoading}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create a New Proposal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto focus:outline-none">
                <DialogHeader>
                  <DialogTitle>Create a New Proposal</DialogTitle>
                  <DialogDescription>
                    Share your project idea and find the perfect team members to
                    collaborate with.
                  </DialogDescription>
                </DialogHeader>
                <CreatePost
                  onSubmit={"addNewPost"}
                  shouldParentUpdate={setNeedsReload}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* TODO: Add common on-demand skills dynamically */}
          {/* <div className="rounded-lg border p-4 space-y-4">
            <h2 className="text-lg font-bold">Popular Skills</h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">React</Badge>
              <Badge variant="secondary">Node.js</Badge>
              <Badge variant="secondary">UI/UX</Badge>
              <Badge variant="secondary">Python</Badge>
              <Badge variant="secondary">Machine Learning</Badge>
              <Badge variant="secondary">AWS</Badge>
              <Badge variant="secondary">DevOps</Badge>
              <Badge variant="secondary">Mobile</Badge>
            </div>
          </div> */}
        </div>

        {/* main content */}
        <div className="flex-1 space-y-6 h-full flex flex-col">
          <Tabs
            defaultValue="all"
            className="flex flex-col flex-1 h-full max-h-[80vh]"
          >
            <TabsList className="grid w-full grid-cols-3 bg-gray-300">
              <TabsTrigger value="all">All Proposals</TabsTrigger>
              <TabsTrigger value="saved">Saved Proposals</TabsTrigger>
              <TabsTrigger value="applied">Applied Proposals</TabsTrigger>
            </TabsList>
            <TabsWithLoader
              value={"all"}
              styles={"mt-6 space-y-6 h-full overflow-auto"}
              isLoading={isLoading}
              // proposalList={allProposals}
              proposalList={allFilteredProposals}
              savedProposals={allSavedProposals}
              appliedProposals={allAppliedProposals}
              shouldParentUpdate={setNeedsReload}
            >
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No projects found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            </TabsWithLoader>
            <TabsWithLoader
              value={"saved"}
              styles={"mt-6 space-y-6 h-full overflow-auto"}
              isLoading={isLoading}
              proposalList={allSavedFilteredProposals}
              savedProposals={allSavedProposals}
              appliedProposals={allAppliedProposals}
              shouldParentUpdate={setNeedsReload}
            >
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No saved projects</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            </TabsWithLoader>
            {/* {console.log("Applied Proposals", allAppliedProposals)} */}
            <TabsWithLoader
              value={"applied"}
              styles={"mt-6 space-y-6 h-full overflow-auto"}
              isLoading={isLoading}
              proposalList={allAppliedFilteredProposals}
              savedProposals={allSavedProposals}
              appliedProposals={allAppliedProposals}
              shouldParentUpdate={setNeedsReload}
            >
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No applied projects</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            </TabsWithLoader>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Proposals;
