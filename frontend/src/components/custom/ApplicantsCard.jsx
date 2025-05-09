import { Check, Forward, MailSearch, Users, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import ConFirmationPopup from "./ConFirmationPopup";
import { Badge } from '@/components/ui/badge';
import { serverAxiosInstance } from "@/utilities/config";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ShowContactInfo from "./ShowContactInfo";


// TODO: Add the send custom email option


const ApplicantsCard = ({ applicant, setShouldUpdate, proposalID }) => {
    // console.log(applicant)

    const navigate = useNavigate();



    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }


    const submissionHandler = (body) => {
        serverAxiosInstance.put('/user/proposal/applicant-status', { ...body }).then((res) => {
            if (res.status === 200) {
                console.log("Status updated successfully")
                toast.success("Status updated successfully", {
                    description: "The status of the applicant has been updated successfully.",
                    duration: 3000,
                })
                setShouldUpdate(prev => prev + 1)
            }
        }).catch((err) => {
            console.log("Error updating status: ", err)
            toast.error("Error updating status", {
                description: "There was an error updating the status of the applicant.",
                duration: 3000,
            })
        })
    }

    const handleAcceptMember = async (id) => {
        console.log("Accepted: ", applicant, id);
        const body = {
            proposalID: proposalID,
            applicantID: id,
            status: "accepted"
        }
        console.log("Body: ", body)
        submissionHandler(body)
    }

    const handleRejectMember = async (id) => {
        console.log("Rejected:", applicant, id);
        // setShouldUpdate(prev => prev + 1)
        const body = {
            proposalID: proposalID,
            applicantID: id,
            status: "rejected"
        }

        console.log("Body: ", body)
        submissionHandler(body)
    }

    const handleContact = async (id) => {
        window.open(`mailto:${applicant?.applicant?.email}`, "_blank");
    }


    return (
        <div
            key={applicant?.id}
            className="flex flex-col sm:flex-row min-h-[8vh] sm:items-center justify-between gap-3 p-3 rounded-md border"
        >
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage
                        src={applicant?.applicant?.about?.profileImg || "/placeholder.svg"}
                        alt={applicant?.applicant?.about?.name || "Applicant"}
                    />
                    <AvatarFallback>
                        {applicant?.applicant?.about?.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-medium line-clamp-1">{applicant?.applicant?.about?.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className='line-clamp-1'>{applicant?.applicant?.about?.title || "Not Disclosed"}</span>
                        <span className="hidden sm:inline-flex">Applied {formatDate(applicant?.appliedOn)}</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-wrap gap-2 items-center">
                <Badge className={
                    applicant?.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : applicant?.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                }>
                    <span className="flex flex-row items-center justify-center space-x-2">
                        {applicant?.status === "accepted" ? <Check className="h-4 w-4" /> :
                            applicant?.status === "rejected" ? <X className="h-4 w-4" /> :
                                <Users className="h-4 w-4" />}
                        <span>
                            {applicant?.status === "accepted" ? "Accepted" :
                                applicant?.status === "rejected" ? "Rejected" :
                                    "Undetermined"}
                        </span>
                    </span>
                </Badge>

                <div className="flex gap-1">
                    {
                        applicant?.status === "undetermined" ?
                            (<>

                                <ConFirmationPopup
                                    triggerTxt={"Accept"}
                                    triggerClass={"textgreen-500 hover:bg-green-100"}
                                    description={`Are you sure you want to accept ${applicant?.applicant?.about?.name} as a member?`}
                                    onConfirm={e => { e.preventDefault(); handleAcceptMember(applicant?.applicant?._id) }}
                                    Icon={Check}
                                />

                                <ConFirmationPopup
                                    triggerTxt={"Reject"}
                                    triggerClass={"textred-500 hover:bg-red-100"}
                                    description={`Are you sure you want to reject ${applicant?.applicant?.about?.name} as a member?`}
                                    onConfirm={e => { e.preventDefault(); handleRejectMember(applicant?.applicant?._id); }}
                                    Icon={X}
                                />
                            </>
                            ) : (
                                applicant?.status === "accepted" ?
                                    (

                                        <ShowContactInfo user={applicant?.applicant} />
                                    ) : (
                                        null
                                    )
                            )
                    }

                    {
                        applicant?.status !== "rejected" &&
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate(`/user/${applicant?.applicant?._id}`)
                            }}
                            title="View Profile"
                        >
                            <span className="flex flex-row items-center justify-center space-x-2">
                                <Forward className="h-4 w-4" />
                            </span>
                            <span className="hidden sm:inline-flex" >
                                View Profile
                            </span>
                        </Button>
                    }
                </div>
            </div>
        </div>
    )
}

export default ApplicantsCard