import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input';
import { useContext, useEffect, useState } from 'react';
import { Loader, Search, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import ManageProposalCard from '@/components/custom/ManageProposalCard';
import { toast } from 'sonner';
import { serverAxiosInstance } from '@/utilities/config';
import { AuthContext } from '@/context/AuthContext';

const ManageProposals = () => {

    const navigate = useNavigate();
    const { getCurrAuth } = useContext(AuthContext);

    const currAuth = getCurrAuth();


    const [isLoading, setIsLoading] = useState(false);

    const [shouldUpdate, setShouldUpdate] = useState(0);

    const [proposalList, setProposalList] = useState([]);
    const [filteredProposalList, setFilteredProposalList] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        if (event.target.value.length === 0) {
            setFilteredProposalList(proposalList);
        }
    };

    const handleSearchOperation = (e) => {
        e.preventDefault();
        if (searchQuery.length > 0) {
            const filteredProposals = proposalList.filter((proposal) => {
                return proposal?.proposalTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    proposal?.proposalDescription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    proposal?.skillsRequired?.some((skill) => skill?.skill?.toLowerCase().includes(searchQuery.toLowerCase()));
            });
            console.log(filteredProposals);
            setFilteredProposalList(filteredProposals);
        }
        else {
            setProposalList(proposalList);
        }
    }



    useEffect(() => {
        if (Object.keys(currAuth).length > 0) {
            if (!currAuth?.about) {
                toast.error("Incomplete profile.", {
                    description: "Please complete your profile to access all features.",
                    duration: 3000,
                });
                navigate("/user/profile");
            }
        }
    }, [currAuth, navigate]);


    useEffect(() => {
        setIsLoading(true);
        const fetchProposals = () => {
            setIsLoading(true);
            serverAxiosInstance.get('/user/proposals/user')
                .then((res) => {
                    if (res.status === 200) {
                        // console.log(res.data);
                        setProposalList(res.data.foundUserProposals);
                        setFilteredProposalList(res.data.foundUserProposals);
                        setIsLoading(false);
                    }
                })
                .catch((err) => {
                    console.error(err);
                    toast.error('Error fetching proposals. Please try again later.', {
                        description: err.response?.data?.message || 'An error occurred',
                        duration: 3000,
                    });
                })
                .finally(() => {
                    setIsLoading(false);
                })
        }
        fetchProposals();
    }, [shouldUpdate])


    return (
        <div className="flex flex-col md:flex-row gap-6 flex-1 h-[80vh] p-8" >
            {/* sidebar */}
            <div className="w-full md:w-64 space-y-6" >
                <div className="rounded-lg border p-4 space-y-4">
                    <h2 className="text-lg font-bold">
                        Manage Proposals
                    </h2>
                    <div className="relative space-y-2">
                        <Input
                            placeholder="Search for proposals..."
                            className="pr-8"
                            value={searchQuery}
                            onChange={handleSearchChange}
                        />
                        {
                            searchQuery.length > 0 &&
                            <Button
                                variant="ghost"
                                className="absolute right-0 top-0 text-muted-foreground"
                                onClick={e => { e.preventDefault(); setSearchQuery(''); setFilteredProposalList(proposalList); }}
                            >
                                <X className="h-full w-4" />
                            </Button>
                        }
                        <Button className={"w-full"} onClick={handleSearchOperation}> {/* Updated variant to "primary" */}
                            Search
                        </Button>
                    </div>
                    <Separator />
                    {/* <div className="flex flex-col space-y-2">
                        <h3 className="text-lg font-bold">Filters</h3>

                        <div className='flex flex-col space-y-1 sm:flex-row sm:space-x-2'>
                            <Button>
                                All
                            </Button>
                            <Button>
                                Recent
                            </Button>
                        </div>
                        <div className='flex flex-col space-y-1 sm:flex-row sm:space-x-2'>
                            <Button>
                                Closed
                            </Button>
                            <Button>
                                Open
                            </Button>
                        </div>
                    </div> */}
                    {/* Stats */}
                    {/* <div className='flex flex-col space-y-2'>
                        <h3 className="text-lg font-bold">Stats</h3>
                        <div className='flex flex-col space-y-1 sm:flex-row sm:space-x-2'>
                            <Badge variant="secondary" className="w-full h-8">
                                {proposalList.length} Proposals
                            </Badge>
                        </div>
                    </div> */}
                    <Separator />
                </div>
            </div>
            {/* main content */}

            < div className="flex-1 space-y-6 h-[80vh]" >
                <h2 className="text-lg font-bold">Proposals List</h2>
                {/* Add logic to display proposals here */}

                {(isLoading) ? (
                    <div className='flex items-center justify-center'>
                        <Loader className="h-8 w-8 animate-spin" />
                    </div>
                ) : (

                    <div className='space-y-2 pb-20'>
                        {
                            filteredProposalList.map((proposal, index) => {
                                return (
                                    <ManageProposalCard proposal={proposal} key={index} setShouldUpdate={setShouldUpdate} />
                                )
                            })
                        }

                    </div>

                )}

            </div >
        </div>
    )
}

export default ManageProposals
