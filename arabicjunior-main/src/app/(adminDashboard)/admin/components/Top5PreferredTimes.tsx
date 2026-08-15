import useAuthAdmin from '@/hooks/useAuthAdmin'
import { Clock } from 'lucide-react'
import React from 'react'

const Top5PreferredTimes = () => {
    const { token } = useAuthAdmin()
    const [sourceData, setSourceData] = React.useState<any>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/insights/top-preferred-times`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    })
                if (!res.ok) throw new Error("Failed to fetch data")

                const json = await res.json();
                const data: any[] = json.data;
                console.log(data)
                setSourceData(data ?? []);
            } catch (err) {
                console.error(err)
                setSourceData([])
            } finally {
                setTimeout(() => {
                    setLoading(false)
                }, 500)
            }
        }
        if (!token) return
        fetchData()
    }, [token])
    return (
        <>
            {sourceData.map((item: any, index: number) => (
                <div
                    key={item.preferred_time}
                    className="flex items-center justify-between rounded-lg shadow-md border p-3 hover:bg-muted/40 transition"
                >
                    <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{item.preferred_time}</span>
                    </div>
                    <span className="text-sm font-semibold text-muted-foreground">
                        {item.count}
                    </span>
                </div>
            ))}
        </>
    )
}

export default Top5PreferredTimes