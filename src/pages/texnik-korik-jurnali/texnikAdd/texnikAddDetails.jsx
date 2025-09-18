import Loading from "@/components/loading/loading";
import {
  useAddTexnikDetailMutation,
  useAddTexnikMutation,
  useGetehtiyotQuery,
  useGetharakatQuery,
  useGetTexnikAddQuery,
  useGetTexnikDetailsQuery,
  useLazyExportExcelTexnikQuery,
  useLazyExportPdftTexnikQuery,
} from "@/services/api";
import {
  CalendarOutlined,
  CaretRightOutlined,
  CopyOutlined,
  DownloadOutlined,
  EyeFilled,
  FileExclamationOutlined,
  LoadingOutlined,
  PlusOutlined,
  SmileOutlined,
  SolutionOutlined,
  SyncOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Collapse,
  Empty,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Steps,
  Switch,
  Upload,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function TexnikAdd() {
  const [formAdd] = Form.useForm();
  const [search, setSearch] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const [yakunlashChecked, setYakunlashChecked] = useState(false);
  const selectedEhtiyot = Form.useWatch("ehtiyot_qismlar", formAdd) || [];

  const [isAddModal, SetIsAddModal] = useState(false);
  const [isEndModal, SetIsEndModal] = useState(false);
  const { Option } = Select;

  const params = useParams();
  const { ide } = params;

  //get
  const { data, isLoading, isError, error } = useGetTexnikAddQuery();
  const { data: texnikdatas, isLoading: loadings } = useGetTexnikDetailsQuery({
    ide,
    search,
  });

  // get ehtiyot qismlar for select
  const { data: dataEhtiyot, isLoading: isLoadingEhtiyot } =
    useGetehtiyotQuery();

  //post
  const [addTexnikDetail, { isLoading: load, error: errr }] =
    useAddTexnikDetailMutation();

  const { data: dataHarakat, isLoading: isLoadingHarakat } =
    useGetharakatQuery();

  const [triggerExport, { isFetching }] = useLazyExportExcelTexnikQuery();
  // pdf
  const [exportPDF, { isFetching: ehtihoyFetching }] =
    useLazyExportPdftTexnikQuery();

  const handleExport = async () => {
    const blob = await triggerExport().unwrap();

    // Faylni yuklash
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "texnik-korik.xlsx"; // fayl nomi
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const handlepdf = async () => {
    const blob = await exportPDF().unwrap();

    // Faylni yuklash
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "texnik-korik.pdf"; // fayl nomi
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleEnd = async (values) => {
    try {
      const formData = new FormData();

      formData.append("korik", ide);
      formData.append("kamchiliklar_haqida", values.kamchiliklar_haqida);

      if (values.ehtiyot_qismlar?.length) {
        values.ehtiyot_qismlar.forEach((item) => {
          formData.append("ehtiyot_qismlar[]", item);
        });
      }

      formData.append(
        "bartaraf_etilgan_kamchiliklar",
        values.bartaraf_etilgan_kamchiliklar
      );

      formData.append("yakunlash", true); // Yakunlash true/false

      // Yakunlash true bo‘lsa, qo‘shimcha ma’lumotlarni ham yuboramiz

      if (values.akt_file && values.akt_file.length > 0) {
        const file = values.akt_file[0].originFileObj;
        formData.append("akt_file", file, file.name);
      }

      // Har doim password jo‘natiladi
      formData.append("password", values.password);

      // API chaqiruv
      await addTexnikDetail(formData).unwrap();

      messageApi.success("Texnik muvaffaqiyatli qo‘shildi!");
      formAdd.resetFields();
      SetIsEndModal(false);
      setYakunlashChecked(false);
    } catch (err) {
      console.error("Xato:", err);
      messageApi.error("Xatolik yuz berdi!");
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Ehtiyot qismlar object ko'rinishida
      const ehtiyotQismlar = (values.ehtiyot_qismlar || []).map((id) => ({
        id: id,
        miqdor: values.ehtiyot_qismlar_miqdor?.[id] || 1,
      }));

      const payload = {
        korik: ide,
        kamchiliklar_haqida: values.kamchiliklar_haqida,
        ehtiyot_qismlar: ehtiyotQismlar,
        bartaraf_etilgan_kamchiliklar: values.bartaraf_etilgan_kamchiliklar,
        password: values.password,
        yakunlash: false,
      };

      console.log(payload);

      const res = await addTexnikDetail(payload).unwrap();
      console.log("Server javobi:", res);
      message.success("Texnik muvaffaqiyatli qo‘shildi!");
      formAdd.resetFields();
      SetIsAddModal(false);
    } catch (err) {
      console.error("Mutation error:", err);
      if (err?.data) {
        console.error("Serverdan:", err.data);
        message.error(err.data.detail || "Server xatosi.");
      } else if (err?.status) {
        message.error("Status: " + err.status);
      } else {
        message.error("Xatolik yuz berdi!");
      }
    }
  };

  if (isLoading || load || loadings || isLoadingEhtiyot || isLoadingHarakat) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loading />
      </div>
    );
  }
  const finded = texnikdatas.steps.results.find((item) => {
    const returns = item.status == "Yakunlandi";
    return returns;
  });

  if (errr) {
    console.log(errr);
  }

  if (isError) {
    console.log("Xato obyekt:", error);
  }

  const handleAdd = () => {
    SetIsAddModal(true);
  };
  const handleEnds = () => {
    SetIsEndModal(true);
  };

  // datani filterlash get uchun
  const filterData = data.results.find((item) => item.id == ide);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    message.success("Nusxa olindi!");
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Yakunlandi":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Jarayonda":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Soz_holatda":
      case "Texnik_korikda":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Yakunlandi":
        return "Yakunlandi";
      case "Soz_holatda":
      case "Texnik_korikda":
        return "Texnik ko'rikda";
      case "Jarayonda":
        return "Jarayonda";
      default:
        return "-";
    }
  };

  const items = texnikdatas?.steps?.results?.map((item) => ({
    key: item.id,
    label: (
      <div className="w-full">
        {/* Mobile-first responsive grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 w-full">
          {/* ID */}
          <div className="flex flex-col space-y-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              ID
            </span>
            <span className="text-sm font-semibold text-gray-900">
              #{item.id}
            </span>
          </div>

          {/* Ta'mir turi */}
          <div className="flex flex-col space-y-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Ta'mir turi
            </span>
            <span className="text-sm font-medium text-gray-900 line-clamp-2">
              {item.tamir_turi_nomi}
            </span>
          </div>

          {/* Holati */}
          <div className="flex flex-col space-y-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Holati
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 ${getStatusStyle(
                item.status
              )}`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  item.status === "Yakunlandi"
                    ? "bg-emerald-500"
                    : item.status === "Jarayonda"
                    ? "bg-blue-500"
                    : "bg-amber-500"
                }`}
              />
              {getStatusText(item.status)}
            </span>
          </div>

          {/* Sana */}
          <div className="flex flex-col space-y-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Yaratilgan sana
            </span>
            <span className="text-sm font-medium text-gray-900">
              {dayjs(item.created_at).format("DD.MM.YYYY HH:mm")}
            </span>
          </div>

          {/* Tasdiqladi */}
          <div className="flex flex-col space-y-1">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Tasdiqladi
            </span>
            <span className="text-sm font-medium text-gray-900 truncate">
              {item.created_by}
            </span>
          </div>
        </div>
      </div>
    ),
    children: (
      <div className="space-y-6 pt-2">
        {/* Bartaraf etilgan kamchiliklar */}
        <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900">
              Bartaraf etilgan kamchiliklar
            </h4>
            {item.bartaraf_etilgan_kamchiliklar && (
              <button
                onClick={() => handleCopy(item.bartaraf_etilgan_kamchiliklar)}
                className="p-1.5 rounded-lg hover:bg-gray-200/60 transition-colors duration-200 group"
              >
                <CopyOutlined className="text-gray-400 group-hover:text-gray-600 text-sm" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed break-words whitespace-pre-line">
            {item.bartaraf_etilgan_kamchiliklar || (
              <span className="text-gray-400 italic">
                Ma'lumot kiritilmagan
              </span>
            )}
          </p>
        </div>

        {/* Kamchilik haqida batafsil xulosa */}
        <div className="bg-blue-50/30 rounded-xl p-4 border border-blue-100/50 ">
          <div className="flex items-start justify-between mb-2 ">
            <h4 className="text-sm font-semibold text-gray-900">
              Kamchilik haqida batafsil xulosa
            </h4>
            {item.kamchiliklar_haqida && (
              <button
                onClick={() => handleCopy(item.kamchiliklar_haqida)}
                className="p-1.5 rounded-lg hover:bg-blue-200/40 transition-colors duration-200 group"
              >
                <CopyOutlined className="text-gray-400 group-hover:text-blue-600 text-sm" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-700 leading-relaxed break-words whitespace-pre-line">
            {item.kamchiliklar_haqida || (
              <span className="text-gray-400 italic">
                Ma'lumot kiritilmagan
              </span>
            )}
          </p>
        </div>

        {/* ehtiyot qism  */}
        <div className="bg-blue-50/30 rounded-xl p-4 border border-blue-100/50">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900">
              Ishlatilgan ehtiyot qismlar
            </h4>
          </div>
          <div className="text-sm text-gray-700 leading-relaxed flex gap-5 flex-wrap">
            {item.ehtiyot_qismlar_detail?.length ? (
              item.ehtiyot_qismlar_detail.map((eht, index) => (
                <Space
                  key={eht.id || index} // 🔑 muhim
                  direction="vertical"
                  size="middle"
                  style={{ minWidth: "150px" }} // 🔄 10% o‘rniga mosroq variant
                >
                  <Badge.Ribbon text={`${eht.miqdor} ${eht.birligi}`}>
                    <Card title={`#${index + 1}`} size="small">
                      {eht.id}
                    </Card>
                  </Badge.Ribbon>
                </Space>
              ))
            ) : (
              <span className="text-gray-400 italic">
                Ma'lumot kiritilmagan
              </span>
            )}
          </div>
        </div>
      </div>
    ),
  }));

  return (
    <div className=" bg-gray-50 min-h-screen">
      {contextHolder}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 w-full flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 bg-gray-200/60 px-3 py-1 rounded-lg inline-block">
            {filterData.tarkib_nomi} | {filterData.tamir_turi_nomi}
          </h1>

          <Input.Search
            placeholder="Tarkib raqami bo‘yicha qidirish..."
            allowClear
            onSearch={(value) => {
              setSearch(value);
            }}
            style={{ width: 500 }}
          />
          <div className="flex justify-center items-center gap-5">
            <Button
              variant="solid"
              color="volcano"
              icon={<DownloadOutlined />}
              loading={ehtihoyFetching}
              onClick={handlepdf}
            >
              Export PDF
            </Button>
            <Button
              variant="solid"
              color="green"
              icon={<DownloadOutlined />}
              loading={isFetching}
              onClick={handleExport}
            >
              Export Excel
            </Button>
            {finded ? (
              <span className="bg-green-500/20 text-green-800 rounded-lg px-3 py-1">
                Yakunlangan:{" "}
                {dayjs(finded.created_at).format("DD.MM.YYYY HH:mm")}
              </span>
            ) : (
              <div className="flex gap-5">
                <Button
                  variant="solid"
                  color="cyan"
                  icon={<FileExclamationOutlined />}
                  onClick={handleEnds}
                >
                  Yakunlash
                </Button>
                <Button
                  variant="solid"
                  color="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAdd}
                >
                  Qo'shish
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <Steps
            current={Math.max(
              0,
              texnikdatas?.steps?.results?.findIndex(
                (s) => s.status === data?.status
              )
            )}
            items={texnikdatas?.steps?.results
              ?.reduce((acc, step) => {
                // Agar oldin qo‘shilmagan bo‘lsa yoki Jarayonda bo‘lsa faqat 1 marta kiradi
                if (
                  step.status === "Jarayonda" &&
                  acc.some((item) => item.status === "Jarayonda")
                ) {
                  return acc;
                }
                acc.push(step);
                return acc;
              }, [])
              ?.map((step) => {
                // Ranglar statusga qarab
                const statusColor =
                  step.status === "Texnik_korikda" ||
                  step.status === "Soz_holatda"
                    ? "#1677ff" // ko‘k
                    : step.status === "Jarayonda"
                    ? "#faad14" // sariq
                    : step.status === "Yakunlandi"
                    ? "#52c41a" // yashil
                    : "#8c8c8c"; // kulrang (default)

                return {
                  title:
                    step.status === "Soz_holatda" ||
                    step.status === "Texnik_korikda"
                      ? "Texnik korikda"
                      : step.status === "Jarayonda"
                      ? "Jarayonda"
                      : step.status === "Yakunlandi"
                      ? "Yakunlandi"
                      : step.status,
                  description:
                    step.kamchiliklar_haqida?.length > 30
                      ? step.kamchiliklar_haqida.slice(0, 30) + "..."
                      : step.kamchiliklar_haqida || "Izoh kiritilmagan",
                  icon:
                    step.status === "Texnik_korikda" ||
                    step.status === "Soz_holatda" ? (
                      <SolutionOutlined style={{ color: statusColor }} />
                    ) : step.status === "Jarayonda" ? (
                      <SyncOutlined style={{ color: statusColor }} /> // endi oddiy icon
                    ) : step.status === "Yakunlandi" ? (
                      <SmileOutlined style={{ color: statusColor }} />
                    ) : (
                      <UserOutlined style={{ color: statusColor }} />
                    ),
                };
              })}
          />
        </div>
        <div className="p-6">
          <Collapse
            bordered={false}
            accordion
            expandIcon={({ isActive }) => (
              <CaretRightOutlined rotate={isActive ? 90 : 0} />
            )}
            items={items}
          />
        </div>
      </div>

      {/* View Modal */}
      <Modal
        title="Texnik qo'shish"
        open={isAddModal}
        onCancel={() => {
          SetIsAddModal(false);
          formAdd.resetFields();
          setYakunlashChecked(false);
        }}
        width={700}
        footer={[
          <Button key="save" type="primary" onClick={() => formAdd.submit()}>
            Saqlash
          </Button>,
        ]}
      >
        <Form form={formAdd} layout="vertical" onFinish={handleSubmit}>
          {/* Kamchiliklar */}
          <Form.Item
            name="kamchiliklar_haqida"
            label="Kamchiliklar haqida"
            rules={[{ required: true, message: "Kamchiliklarni kiriting!" }]}
          >
            <Input.TextArea rows={3} placeholder="Kamchiliklarni yozing..." />
          </Form.Item>

          {/* Ehtiyot qismlar */}
          <Form.Item
            name="ehtiyot_qismlar"
            label="Ehtiyot qismlarni tanlang"
            rules={[{ required: true, message: "Ehtiyot qismlarni tanlang!" }]}
          >
            <Select mode="multiple" placeholder="Ehtiyot qismlarni tanlang">
              {dataEhtiyot?.results?.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.ehtiyotqism_nomi} ({item.birligi})
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* ✅ Tanlangan ehtiyot qismlarga qarab avtomatik miqdor inputlarini qo‘shish */}
          {selectedEhtiyot.map((id) => {
            const selectedItem = dataEhtiyot?.results?.find((q) => q.id === id);
            return (
              <Form.Item
                key={id}
                name={["ehtiyot_qismlar_miqdor", id]}
                label={`${selectedItem?.ehtiyotqism_nomi} ${selectedItem?.birligi}`}
                rules={[{ required: true, message: "Miqdor kiriting!" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            );
          })}

          {/* Bartaraf etilgan kamchiliklar */}
          <Form.Item
            name="bartaraf_etilgan_kamchiliklar"
            label="Nosozlikni bartaraf qilgan xulosasi"
            rules={[{ required: true, message: "Ma'lumot kiriting!" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Nosozlikni tartaraf qilgan xulosasini yozing"
            />
          </Form.Item>

          {/* Password */}
          <Form.Item
            name="password"
            label="Parol"
            rules={[{ required: true, message: "Parolni kiriting!" }]}
          >
            <Input.Password placeholder="Parol" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Texnik ko'rikni yakunlash"
        open={isEndModal}
        onCancel={() => {
          SetIsEndModal(false);
          formAdd.resetFields();
          setYakunlashChecked(false);
        }}
        width={700}
        footer={[
          <Button key="save" type="primary" onClick={() => formAdd.submit()}>
            Saqlash
          </Button>,
        ]}
      >
        <Form form={formAdd} layout="vertical" onFinish={handleEnd}>
          {/* Kamchiliklar */}
          <Form.Item
            name="kamchiliklar_haqida"
            label="Kamchiliklar haqida"
            rules={[{ required: true, message: "Kamchiliklarni kiriting!" }]}
          >
            <Input.TextArea rows={3} placeholder="Kamchiliklarni yozing..." />
          </Form.Item>

          {/* Ehtiyot qismlar */}
          <Form.Item
            name="ehtiyot_qismlar"
            label="Ehtiyot qismlarni tanlang"
            rules={[{ required: true, message: "Ehtiyot qismlarni tanlang!" }]}
          >
            <Select mode="multiple" placeholder="Ehtiyot qismlarni tanlang">
              {dataEhtiyot?.results?.map((item) => (
                <Option key={item.id} value={item.id}>
                  {item.ehtiyotqism_nomi} ({item.birligi})
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* ✅ Tanlangan ehtiyot qismlarga qarab avtomatik miqdor inputlarini qo‘shish */}
          {selectedEhtiyot.map((id) => {
            const selectedItem = dataEhtiyot?.results?.find((q) => q.id === id);
            return (
              <Form.Item
                key={id}
                name={["ehtiyot_qismlar_miqdor", id]}
                label={`${selectedItem?.ehtiyotqism_nomi} ${selectedItem?.birligi}`}
                rules={[{ required: true, message: "Miqdor kiriting!" }]}
              >
                <InputNumber min={1} style={{ width: "100%" }} />
              </Form.Item>
            );
          })}

          {/* Bartaraf etilgan kamchiliklar */}
          <Form.Item
            name="bartaraf_etilgan_kamchiliklar"
            label="Nosozlikni bartaraf qilgan xulosasi"
            rules={[{ required: true, message: "Ma'lumot kiriting!" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Nosozlikni tartaraf qilgan xulosasini yozing"
            />
          </Form.Item>

          <Form.Item
            name="akt_file"
            label="Akt fayl"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
            rules={[{ required: true, message: "Akt fayl yuklash majburiy!" }]}
          >
            <Upload
              name="akt_file"
              listType="picture"
              maxCount={1}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>Akt fayl yuklash</Button>
            </Upload>
          </Form.Item>

          {/* Password */}
          <Form.Item
            name="password"
            label="Parol"
            rules={[{ required: true, message: "Parolni kiriting!" }]}
          >
            <Input.Password placeholder="Parol" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

<style jsx global>{`
  .apple-collapse .ant-collapse-item {
    background: white;
    border: 1px solid #f1f5f9;
    border-radius: 16px;
    margin-bottom: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .apple-collapse .ant-collapse-item:hover {
    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08);
    border-color: #e2e8f0;
  }

  .apple-collapse .ant-collapse-header {
    padding: 20px 24px !important;
    border: none !important;
    background: transparent;
  }

  .apple-collapse .ant-collapse-header:hover {
    background: rgba(248, 250, 252, 0.5) !important;
  }

  .apple-collapse .ant-collapse-content {
    border: none !important;
    background: transparent;
  }

  .apple-collapse .ant-collapse-content-box {
    padding: 0 24px 24px 24px !important;
  }

  .apple-collapse .ant-collapse-expand-icon {
    color: #64748b !important;
    font-size: 14px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  .apple-collapse .ant-collapse-item-active .ant-collapse-expand-icon {
    color: #3b82f6 !important;
  }

  .apple-collapse .ant-collapse-expand-icon:hover {
    color: #3b82f6 !important;
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`}</style>;
