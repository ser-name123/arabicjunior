
import useAuthAdmin from "@/hooks/useAuthAdmin";
import { ChartNoAxesCombined, UserRoundCheck, UserRoundX, Users2Icon } from "lucide-react";
import React from "react";

const TileCard = ({
    title,
    value,
    icon,
    male = 0,
    female = 0
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    male?: any;
    female?: any;
}) => {
    return (
        // <div className="w-full max-w-full px-3 mb-6 sm:flex-none xl:mb-0 ">
        <div className="relative flex flex-col min-w-0 break-words bg-background dark:bg-secondary/30 dark:border-0 shadow-sm border-1 border rounded-2xl bg-clip-border">
            <div className="flex-auto p-4">
                <div className="flex flex-row justify-between">
                    <div className="flex-none max-w-full">
                        <div>
                            <p className="mb-0 font-sans font-semibold leading-normal text-sm">
                                {title}
                            </p>
                            <h5 className="mb-0 text-xl font-bold">
                                {value}
                            </h5>
                        </div>
                        <p className="text-[10px] flex items-center gap-2 mt-2 text-secondary-foreground">
                            <span className="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-venus-icon lucide-venus"><path d="M12 15v7" /><path d="M9 19h6" /><circle cx="12" cy="9" r="6" /></svg>
                                <span>{male}</span>
                            </span>
                            <span className="flex items-center gap-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mars-icon lucide-mars"><path d="M16 3h5v5" /><path d="m21 3-6.75 6.75" /><circle cx="10" cy="14" r="6" /></svg>
                                <span>{female}</span>
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500/70 to-orange-500">
                        {icon}
                    </div>
                </div>
            </div>
        </div>
        // </div>
    );
};

export function SectionCards() {
    const { token } = useAuthAdmin()
    const [sourceData, setSourceData] = React.useState<any>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/insights/dashboard-tile`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    })
                if (!res.ok) throw new Error("Failed to fetch data")

                const json = await res.json();
                const data: any = json;
                setSourceData(data ?? null);
            } catch (err) {
                console.error(err)
                setSourceData(null)
            } finally {
                setTimeout(() => {
                    setLoading(false)
                }, 500)
            }
        }
        fetchData()
    }, [])
    return (
        <div className="grid grid-cols-1 gap-4 justify-between sm:grid-cols-2 lg:grid-cols-4">
            <TileCard
                title="Trial Students"
                value={sourceData?.trialStudents?.total ?? 0}
                icon={<Users2Icon className="text-lg text-white" />}
                male={sourceData?.trialStudents?.male ?? 0}
                female={sourceData?.trialStudents?.female ?? 0}
            />

            <TileCard
                title="Registered Students"
                value={sourceData?.registeredStudents?.total ?? 0}
                icon={<UserRoundCheck className="text-lg text-white" />}
                male={sourceData?.registeredStudents?.male ?? 0}
                female={sourceData?.registeredStudents?.female ?? 0}
            />

            <TileCard
                title="Pending Trial Students"
                value={sourceData?.pendingTrialStudents?.total ?? 0}
                icon={<UserRoundX className="text-lg text-white" />}
                male={sourceData?.pendingTrialStudents?.male ?? 0}
                female={sourceData?.pendingTrialStudents?.female ?? 0}
            />

            <TileCard
                title="Conversion Rate"
                value={`${sourceData?.conversionRate?.total ?? 0}`}
                icon={<ChartNoAxesCombined className="text-lg text-white" />}
                male={`${sourceData?.conversionRate?.male ?? 0}`}
                female={`${sourceData?.conversionRate?.female ?? 0}`}
            />

        </div>
    )
}
