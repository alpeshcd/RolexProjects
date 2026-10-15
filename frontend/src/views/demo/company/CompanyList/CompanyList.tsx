import AdaptiveCard from "@/components/shared/AdaptiveCard";
import Container from "@/components/shared/Container";
import CompanyListActionTools from "./components/CompanyListActionTools";
import CompanyListTableTools from "./components/CompanyListTableTools";
import CompanyListTable from "./components/CompanyListTable";
import CompanyListSelected from "./components/CompanyListSelected";


const CustomerList = () => {
    return (
        <>
            <Container>
                <AdaptiveCard>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <h3>Company</h3>
                            <CompanyListActionTools />
                        </div>
                        <CompanyListTableTools />
                        <CompanyListTable />
                    </div>
                </AdaptiveCard>
            </Container>
            <CompanyListSelected />
        </>
    );
};

export default CustomerList;
