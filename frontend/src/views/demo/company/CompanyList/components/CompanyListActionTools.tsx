import Button from "@/components/ui/Button";
import { TbUserPlus } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import useCustomerList from "../hooks/useCustomerList";
import { CSVLink } from "react-csv";

const CompanyListActionTools = () => {
    const navigate = useNavigate();

    const { customerList } = useCustomerList();

    return (
        <div className="flex flex-col md:flex-row gap-3">
            <CSVLink className="w-full" filename="customerList.csv" data={customerList}></CSVLink>
            <Button variant="solid" icon={<TbUserPlus className="text-xl" />} onClick={() => navigate("/company/create")}>
                Add new
            </Button>
        </div>
    );
};

export default CompanyListActionTools;
