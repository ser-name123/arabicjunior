import useAuthAdmin from '@/hooks/useAuthAdmin'
import React from 'react'

const Top5Curriculams = () => {
    const { token } = useAuthAdmin()
    const [sourceData, setSourceData] = React.useState<any>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true)

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/insights/top-5-curriculums`,
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
        <table className="w-full text-sm">
            <thead>
                <tr className="text-left text-muted-foreground">
                    <th className="py-2">Rank</th>
                    <th className="py-2">Curriculum</th>
                    <th className="py-2 text-right">Students</th>
                </tr>
            </thead>
            <tbody>
                {sourceData.map((item: any, index: number) => (
                    <tr key={item.curriculum} className="border-t">
                        <td className="py-2">{index + 1}</td>
                        <td className="py-2">{item.curriculum}</td>
                        <td className="py-2 text-right font-medium">{item.count}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}

export default Top5Curriculams