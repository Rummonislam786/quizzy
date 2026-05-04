import { useEffect, useState, useCallback } from 'react';
import {
  Button, Input, Table, Space, Modal, Form,
  Switch, message, Popconfirm, Tag, Pagination,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion } from '../services/api';
import type { Question, Choice, CreateQuestionRequest } from '@quizzy/types';
import styles from './AdminPage.module.css';

type QuestionWithChoices = Question & { choices: Choice[] };

interface ChoiceField {
  choice_text: string;
  is_correct: boolean;
}

interface QuestionFormValues {
  question_text: string;
  explanation_text: string;
  choices: ChoiceField[];
}

const PAGE_SIZE = 10;

export default function AdminPage() {
  const [questions, setQuestions] = useState<QuestionWithChoices[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionWithChoices | null>(null);
  const [form] = Form.useForm<QuestionFormValues>();
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async (searchVal: string, pageVal: number) => {
    setLoading(true);
    try {
      const result = await getQuestions({
        search: searchVal,
        limit: PAGE_SIZE,
        offset: (pageVal - 1) * PAGE_SIZE,
      });
      setQuestions(result.data as QuestionWithChoices[]);
      setTotal(result.total);
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(search, page);
  }, [fetchData, search, page]);

  const openCreate = () => {
    setEditingQuestion(null);
    form.setFieldsValue({
      question_text: '',
      explanation_text: '',
      choices: [
        { choice_text: '', is_correct: true },
        { choice_text: '', is_correct: false },
        { choice_text: '', is_correct: false },
        { choice_text: '', is_correct: false },
      ],
    });
    setModalOpen(true);
  };

  const openEdit = (q: QuestionWithChoices) => {
    setEditingQuestion(q);
    form.setFieldsValue({
      question_text: q.question_text,
      explanation_text: q.explanation_text,
      choices: q.choices.map((c) => ({
        choice_text: c.choice_text,
        is_correct: c.is_correct,
      })),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    let values: QuestionFormValues;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    const correctCount = values.choices.filter((c) => c.is_correct).length;
    if (correctCount !== 1) {
      message.error('Exactly one choice must be marked correct');
      return;
    }

    setSaving(true);
    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, values);
        message.success('Question updated');
      } else {
        await createQuestion(values as CreateQuestionRequest);
        message.success('Question created');
      }
      setModalOpen(false);
      fetchData(search, page);
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteQuestion(id);
      message.success('Question deleted');
      fetchData(search, page);
    } catch (err) {
      message.error((err as Error).message);
    }
  };

  const handleCorrectToggle = (index: number) => {
    const choices = form.getFieldValue('choices') as ChoiceField[];
    const updated = choices.map((c, i) => ({ ...c, is_correct: i === index }));
    form.setFieldValue('choices', updated);
  };

  const columns = [
    {
      title: 'Question',
      dataIndex: 'question_text',
      key: 'question_text',
      render: (text: string) => <span className={styles.qText}>{text}</span>,
    },
    {
      title: 'Choices',
      key: 'choices',
      width: 120,
      render: (_: unknown, record: QuestionWithChoices) => (
        <Tag color="default">{record.choices.length} choices</Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (d: string) => new Date(d).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: QuestionWithChoices) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEdit(record)}
          />
          <Popconfirm
            title="Delete this question?"
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            okButtonProps={{ danger: true }}
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>ADMIN</h1>
        <p className={styles.subtitle}>Manage quiz questions</p>
      </div>

      <div className={styles.toolbar}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search questions..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{ maxWidth: 320 }}
          allowClear
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Add Question
        </Button>
      </div>

      <Table
        dataSource={questions}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={false}
        className={styles.table}
        locale={{ emptyText: 'No questions found' }}
      />

      <div className={styles.pagination}>
        <Pagination
          current={page}
          total={total}
          pageSize={PAGE_SIZE}
          onChange={setPage}
          showTotal={(t) => `${t} questions`}
          showSizeChanger={false}
        />
      </div>

      <Modal
        title={editingQuestion ? 'Edit Question' : 'Add Question'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText={saving ? 'Saving...' : 'Save'}
        confirmLoading={saving}
        width={640}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className={styles.form}>
          <Form.Item
            name="question_text"
            label="Question"
            rules={[{ required: true, message: 'Question text is required' }]}
          >
            <Input.TextArea rows={3} placeholder="Enter the question..." />
          </Form.Item>

          <Form.Item
            name="explanation_text"
            label="Explanation (shown for wrong answers)"
            rules={[{ required: true, message: 'Explanation is required' }]}
          >
            <Input.TextArea rows={2} placeholder="Explain the correct answer..." />
          </Form.Item>

          <div className={styles.choicesLabel}>
            Choices <span className={styles.choicesHint}>(toggle to mark correct)</span>
          </div>

          <Form.List name="choices">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Form.Item key={field.key} style={{ marginBottom: 8 }}>
                    <div className={styles.choiceRow}>
                      <Form.Item
                        name={[field.name, 'is_correct']}
                        noStyle
                        valuePropName="checked"
                      >
                        <Switch
                          size="small"
                          onChange={(checked) => {
                            if (checked) handleCorrectToggle(index);
                          }}
                        />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, 'choice_text']}
                        noStyle
                        rules={[{ required: true, message: 'Choice text required' }]}
                      >
                        <Input
                          placeholder={`Choice ${index + 1}`}
                          style={{ flex: 1 }}
                        />
                      </Form.Item>
                      {fields.length > 2 && (
                        <Button
                          size="small"
                          danger
                          onClick={() => remove(field.name)}
                          icon={<DeleteOutlined />}
                        />
                      )}
                    </div>
                  </Form.Item>
                ))}
                {fields.length < 6 && (
                  <Button
                    type="dashed"
                    onClick={() => add({ choice_text: '', is_correct: false })}
                    icon={<PlusOutlined />}
                    style={{ width: '100%' }}
                  >
                    Add Choice
                  </Button>
                )}
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}
