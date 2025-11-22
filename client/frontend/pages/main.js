import { useState, useEffect, useRef } from 'react';
import {
  FiSettings, FiBell, FiUser, FiPlus,
  FiCheck, FiEdit3, FiTrash2, FiCalendar,
  FiAlignLeft, FiCheckSquare, FiAlertCircle,
  FiTag, FiDollarSign, FiChevronDown
} from 'react-icons/fi';

export default function TelaGrupo() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [tarefas, setTarefas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [contas, setContas] = useState([
    { id: 1, nome: 'Sem categoria', valor: 0, cor: '#91B6E4' },
    { id: 2, nome: 'Sem categoria', valor: 0, cor: '#E4A87B' },
    { id: 3, nome: 'Sem categoria', valor: 0, cor: '#B57BE4' },
    { id: 4, nome: 'Sem categoria', valor: 0, cor: '#A0BF9F' },
    { id: 5, nome: 'Sem categoria', valor: 0, cor: '#9BBFC0' },
  ]);
  const totalContas = contas.reduce((acc, c) => acc + c.valor, 0);

  const [scrolled, setScrolled] = useState(false);
  const mainRef = useRef(null);

  // === REDIMENSIONAMENTO SUAVE E CONFINADO ===
  const [columnWidths, setColumnWidths] = useState({
    tarefas: [50, 220, 130, 110, 120, 70],
    compras: [50, 220, 110, 100, 110, 70]
  });
  const isResizing = useRef(null);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const animationFrame = useRef(null);

  const startResize = (e, table, colIndex) => {
    e.preventDefault();
    isResizing.current = { table, colIndex };
    startX.current = e.clientX;
    startWidth.current = columnWidths[table][colIndex];
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.body.style.pointerEvents = 'none';
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isResizing.current) return;
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      animationFrame.current = requestAnimationFrame(() => {
        const { table, colIndex } = isResizing.current;
        const diff = e.clientX - startX.current;
        const newWidth = Math.max(40, startWidth.current + diff);
        const maxWidth = table === 'tarefas' ? 300 : 280;
        setColumnWidths(prev => ({
          ...prev,
          [table]: prev[table].map((w, i) =>
            i === colIndex ? Math.min(newWidth, maxWidth) : w
          )
        }));
      });
    };

    const handlePointerUp = () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      isResizing.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.style.pointerEvents = '';
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [columnWidths]);

  // === REMOÇÃO COM ANIMAÇÃO SUAVE ===
  const [removingTaskId, setRemovingTaskId] = useState(null);
  const [removingCompraId, setRemovingCompraId] = useState(null);

  const handleTaskCheck = (taskId) => {
    setRemovingTaskId(taskId);
    setTimeout(() => {
      setTarefas(prev => prev.filter(t => t.id !== taskId));
      setRemovingTaskId(null);
    }, 280);
  };

  const handleCompraCheck = (compraId) => {
    setRemovingCompraId(compraId);
    setTimeout(() => {
      setCompras(prev => prev.filter(c => c.id !== compraId));
      setRemovingCompraId(null);
    }, 280);
  };

  // === POPUPS PRINCIPAIS ===
  const [showCreateGroup, setShowCreateGroup] = useState(true);
  const [showInviteCode, setShowInviteCode] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  // === EDIÇÃO INLINE ===
  const [editingTask, setEditingTask] = useState(null);
  const [editingCompra, setEditingCompra] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(null);

  // === MENU DE CONTEXTO ===
  const [contextMenu, setContextMenu] = useState(null);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editName, setEditName] = useState('');

  // === CACHE DO GRUPO SELECIONADO ===
  const prevSelectedRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (mainRef.current) setScrolled(mainRef.current.scrollTop > 0);
    };
    mainRef.current?.addEventListener('scroll', handleScroll);
    return () => mainRef.current?.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setShowDatePicker(null);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  useEffect(() => {
    if (selectedGroup && selectedGroup !== prevSelectedRef.current) {
      prevSelectedRef.current = selectedGroup;
      setTarefas(selectedGroup.tarefas || []);
      setCompras(selectedGroup.compras || []);
      setContas(selectedGroup.contas || []);
    }
  }, [selectedGroup]);

  // === GERAR CÓDIGO (fallback) ===
  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 20; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // === USER ID (do login) ===
  const [userIdDebug, setUserIdDebug] = useState(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('uid');
    const storedSession = sessionStorage.getItem('user_id');
    const storedLocal = localStorage.getItem('user_id');
    const finalId = fromQuery || storedSession || storedLocal || null;
    console.log('[main] ID detectado (query/session/local):', {
      fromQuery,
      storedSession,
      storedLocal,
      final: finalId
    });
    if (!finalId) {
      console.warn('[main] Nenhum user_id encontrado.');
    }
    setUserIdDebug(finalId);
  }, []);

  // === CRIAR GRUPO (BACKEND) ===
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || !groupDescription.trim()) return;
    if (!userIdDebug) {
      alert('Usuário não identificado. Faça login novamente.');
      return;
    }

    try {
      const createResp = await fetch('http://localhost:8000/grupo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: groupName,
          descricao: groupDescription,
          group_owner: userIdDebug,
        }),
      });

      const createData = await createResp.json();
      if (!createResp.ok) {
        console.error('[main] Erro ao criar grupo:', createData);
        alert(createData.detail || 'Erro ao criar grupo.');
        return;
      }

      const grupo = createData.data;
      const grupoId = grupo?.id;
      const codConvite = grupo?.cod_convite;

      if (!grupoId) {
        alert('Grupo criado, mas ID não retornado pelo backend.');
        return;
      }

      // vincular usuário ao grupo
      const linkResp = await fetch(
        `http://localhost:8000/usuario/${encodeURIComponent(
          userIdDebug
        )}/grupo?grupo_id=${grupoId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const linkData = await linkResp.json();
      if (!linkResp.ok) {
        console.error('[main] Erro ao vincular usuário ao grupo:', linkData);
        alert(
          linkData.detail ||
          'Grupo criado, mas houve erro ao vincular o usuário ao grupo.'
        );
      }

      const newGroup = {
        id: grupoId,
        name: grupo.nome,
        icon: '/planta.png',
        tarefas: [],
        compras: [],
        contas: [...contas],
      };

      setGroups(prev => [...prev, newGroup]);
      setSelectedGroup(newGroup);
      setGeneratedCode(
        typeof codConvite === 'number' ? String(codConvite) : generateCode()
      );
      setShowCode(false);
      setCopied(false);
      setShowCreateGroup(false);
      setShowInviteCode(true);
      setGroupName('');
      setGroupDescription('');
      setInviteCode('');
    } catch (err) {
      console.error('[main] Erro inesperado ao criar grupo:', err);
      alert('Erro inesperado ao criar grupo. Tente novamente.');
    }
  };

  // === ENTRAR COM CONVITE (BACKEND) ===
  const handleJoinWithInvite = async (e) => {
    e.preventDefault();
    const trimmed = inviteCode.trim();
    if (!trimmed) {
      alert('Informe o código de convite.');
      return;
    }
    if (!userIdDebug) {
      alert('Usuário não identificado. Faça login novamente.');
      return;
    }

    const numericCode = Number(trimmed);
    if (Number.isNaN(numericCode)) {
      alert('Código inválido.');
      return;
    }

    try {
      const grupoResp = await fetch(
        `http://localhost:8000/grupo/codigo/${numericCode}`
      );
      const grupoData = await grupoResp.json();
      if (!grupoResp.ok) {
        console.error('[main] Erro ao buscar grupo por código:', grupoData);
        alert(grupoData.detail || 'Grupo não encontrado para esse código.');
        return;
      }

      const grupo = grupoData.data;
      const grupoId = grupo?.id;
      if (!grupoId) {
        alert('Grupo encontrado, mas ID não retornado pelo backend.');
        return;
      }

      const linkResp = await fetch(
        `http://localhost:8000/usuario/${encodeURIComponent(
          userIdDebug
        )}/grupo?grupo_id=${grupoId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const linkData = await linkResp.json();
      if (!linkResp.ok) {
        console.error('[main] Erro ao vincular usuário ao grupo (convite):', linkData);
        alert(
          linkData.detail ||
          'Erro ao vincular usuário ao grupo via convite.'
        );
        return;
      }

      const newGroup = {
        id: grupoId,
        name: grupo.nome,
        icon: '/planta.png',
        tarefas: [],
        compras: [],
        contas: [...contas],
      };

      setGroups(prev => [...prev, newGroup]);
      setSelectedGroup(newGroup);
      setShowCreateGroup(false);
      setInviteCode('');
    } catch (err) {
      console.error('[main] Erro inesperado ao entrar por convite:', err);
      alert('Erro inesperado ao entrar por convite. Tente novamente.');
    }
  };

  // === COPIAR CÓDIGO ===
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 5000);
  };

  // === FECHAR POPUPS ===
  const closePopups = () => {
    setShowCreateGroup(false);
    setShowInviteCode(false);
    setInviteCode('');
    setGroupName('');
    setGroupDescription('');
  };

  // === MENU DE CONTEXTO ===
  const openContextMenu = (e, group) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, groupId: group.id });
  };

  const startRename = (group) => {
    setEditingGroupId(group.id);
    setEditName(group.name);
    setContextMenu(null);
  };

  const saveRename = () => {
    if (!editName.trim()) return;
    setGroups(prev => prev.map(g => g.id === editingGroupId ? { ...g, name: editName } : g));
    if (selectedGroup?.id === editingGroupId) {
      setSelectedGroup(prev => ({ ...prev, name: editName }));
    }
    setEditingGroupId(null);
    setEditName('');
  };

  const deleteGroup = () => {
    const newGroups = groups.filter(g => g.id !== contextMenu?.groupId);
    setGroups(newGroups);
    if (selectedGroup?.id === contextMenu?.groupId && newGroups.length > 0) {
      setSelectedGroup(newGroups[0]);
    }
    setContextMenu(null);
  };

  // === TAREFAS / COMPRAS / CONTAS / CALENDÁRIO ===
  const addTask = () => {
    const newTask = {
      id: Date.now(),
      descricao: '',
      status: '',
      prioridade: 'Média',
      data: '',
      responsavel: '/p1.png',
      editing: true
    };
    setTarefas(prev => [...prev, newTask]);
    setEditingTask(newTask.id);
  };

  const saveTask = (id) => {
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, editing: false } : t));
    setEditingTask(null);
  };

  const deleteTask = (id) => {
    setTarefas(prev => prev.filter(t => t.id !== id));
  };

  // === CICLO DE STATUS ===
  const cycleStatus = (taskId) => {
    setTarefas(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const order = ['', 'Não começou', 'Em andamento', 'Concluída'];
      const currentIndex = order.indexOf(t.status);
      const nextIndex = (currentIndex + 1) % order.length;
      return { ...t, status: order[nextIndex] };
    }));
  };

  // === CICLO DE PRIORIDADE ===
  const cyclePrioridade = (id, isTask = true) => {
    const setter = isTask ? setTarefas : setCompras;
    setter(prev => prev.map(item => {
      if (item.id !== id) return item;
      const order = ['Baixa', 'Média', 'Alta'];
      const currentIndex = order.indexOf(item.prioridade);
      const nextIndex = (currentIndex + 1) % order.length;
      return { ...item, prioridade: order[nextIndex] };
    }));
  };

  // === CICLO DE TIPO (COMPRAS) ===
  const cycleTipo = (compraId) => {
    setCompras(prev => prev.map(c => {
      if (c.id !== compraId) return c;
      const order = ['Outros', 'Limpeza', 'Comida'];
      const currentIndex = order.indexOf(c.tipo);
      const nextIndex = (currentIndex + 1) % order.length;
      return { ...c, tipo: order[nextIndex] };
    }));
  };

  // === COMPRAS ===
  const addCompra = () => {
    const newCompra = {
      id: Date.now(),
      produto: '',
      tipo: 'Outros',
      prioridade: 'Média',
      valor: '',
      responsavel: '/p1.png',
      editing: true
    };
    setCompras(prev => [...prev, newCompra]);
    setEditingCompra(newCompra.id);
  };

  const saveCompra = (id) => {
    setCompras(prev => prev.map(c => c.id === id ? { ...c, editing: false } : c));
    setEditingCompra(null);
  };

  const deleteCompra = (id) => {
    setCompras(prev => prev.filter(c => c.id !== id));
  };

  // === FORMATAÇÃO DE MOEDA ===
  const formatCurrency = (value) => {
    if (!value && value !== 0) return '';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // === ATUALIZAR CONTA ===
  const updateConta = (id, field, inputValue) => {
    if (field !== 'valor') {
      setContas(prev => prev.map(c => c.id === id ? { ...c, [field]: inputValue } : c));
      return;
    }

    const digits = inputValue.replace(/\D/g, '');
    if (!digits) {
      setContas(prev => prev.map(c => c.id === id ? { ...c, valor: 0 } : c));
      return;
    }

    const number = parseInt(digits, 10);
    const reais = Math.floor(number / 100);
    const centavos = number % 100;
    const finalValue = reais + (centavos / 100);

    setContas(prev => prev.map(c => c.id === id ? { ...c, valor: finalValue } : c));
  };

  // === ATUALIZAR VALOR DE COMPRA ===
  const updateCompraValor = (id, inputValue) => {
    const digits = inputValue.replace(/\D/g, '');
    if (!digits) {
      setCompras(prev => prev.map(c => c.id === id ? { ...c, valor: '' } : c));
      return;
    }

    const number = parseInt(digits, 10);
    const finalValue = (number / 100).toFixed(2);
    setCompras(prev => prev.map(c => c.id === id ? { ...c, valor: finalValue } : c));
  };

  // === CALENDÁRIO ===
  const renderDatePicker = (taskId, currentDate) => {
    const date = currentDate ? new Date(currentDate) : new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return (
      <div style={{
        position: 'absolute', top: '100%', left: 0, background: '#fff', border: '1px solid #ddd',
        borderRadius: 12, padding: 12, boxShadow: '0 8px 25px rgba(0,0,0,.12)', zIndex: 100, fontSize: 13
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
            <div key={d} style={{ textAlign: 'center', fontWeight: 600, color: '#666' }}>{d}</div>
          ))}
          {Array.from({ length: new Date(year, month, 1).getDay() }, (_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            return (
              <div
                key={day}
                style={{
                  textAlign: 'center', padding: '6px 4px', cursor: 'pointer', borderRadius: 8,
                  background: currentDate === dateStr ? '#C1D9C1' : 'transparent',
                  color: currentDate === dateStr ? '#000' : '#333',
                  fontWeight: currentDate === dateStr ? 600 : 400
                }}
                onClick={() => {
                  setTarefas(prev => prev.map(t => t.id === taskId ? { ...t, data: dateStr } : t));
                  setShowDatePicker(null);
                }}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <style jsx>{`
        @font-face {font-family:'Airbnb Cereal';src:url('../fonts/AirbnbCereal_W_Lt.otf') format('opentype');font-weight:300;}
        @font-face {font-family:'Airbnb Cereal';src:url('../fonts/AirbnbCereal_W_Md.otf') format('opentype');font-weight:500;}
        @font-face {font-family:'Airbnb Cereal';src:url('../fonts/AirbnbCereal_W_Bd.otf') format('opentype');font-weight:700;}
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#fff;font-family:'Airbnb Cereal',sans-serif;}

        .container{display:flex;height:100vh;background:#fff;}
        .sidebar{width:230px;background:#fff;padding:20px;display:flex;flex-direction:column;border-right:1px solid #e2e2e2;}
        .profile{display:flex;align-items:center;gap:10px;margin-bottom:30px;}
        .profile img{width:40px;height:40px;border-radius:50%;}
        .menu li{list-style:none;margin:10px 0;display:flex;align-items:center;gap:8px;font-weight:500;font-size:15px;color:#333;cursor:pointer;}
        .groups{margin-top:20px;flex:1;}
        .groups p{font-weight:700;font-size:13px;color:#6b7280;margin-bottom:8px;}
        .group-item{display:flex;align-items:center;gap:8px;font-weight:500;font-size:15px;color:#333;cursor:pointer;padding:4px 0;position:relative;}
        .group-item img{width:20px;height:20px;}
        .group-item.active{font-weight:700;color:#000;}
        .group-item span{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500;font-size:15px;}
        .add-group{margin-top:12px;color:#888;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;font-weight:600;font-size:15px;}

        .main{flex:1;overflow-y:auto;position:relative;}
        .fixed-header{position:sticky;top:0;left:0;right:0;z-index:20;background:rgba(255,255,255,.65);backdrop-filter:blur(12px);padding:16px 0;display:flex;align-items:center;gap:12px;transition:all .3s ease;border-bottom:${scrolled ? '1px solid #e2e2e2' : 'none'};}
        .header-content{display:flex;align-items:center;gap:12px;flex:1;padding-left:48px;}
        .header-actions{display:flex;align-items:center;gap:16px;padding-right:48px;}
        .header-actions img{width:18px;height:18px;cursor:pointer;}
        .share-text{font-weight:400;font-size:15px;color:#555;cursor:pointer;}
        .content{padding:32px 48px 48px 48px;}
        .title-section{display:flex;align-items:flex-start;gap:24px;margin-bottom:32px;}
        .title-left{display:flex;flex-direction:column;align-items:flex-start;}
        .plant-large{width:80px;height:80px;margin-bottom:8px;}
        .group-name{font-size:36px;font-weight:700;color:#000;margin:0;}
        .members-line{display:flex;align-items:center;gap:12px;margin-top:8px;font-size:15px;color:#666;}
        .profile-stack{display:flex;align-items:center;}
        .profile-img{width:32px;height:32px;border-radius:50%;border:.5px solid #fff;box-shadow:0 0 0 1px #fff;margin-left:-16px;}
        .profile-img:first-child{margin-left:0;}

        .dashboard{background:#fafafa;border-radius:35px;padding:28px;margin-bottom:28px;box-shadow:0 6px 30px rgba(0,0,0,.12);transition:box-shadow .3s;overflow:hidden;}
        .dashboard:hover{box-shadow:0 12px 40px rgba(160,191,159,.35);}
        .dashboard h3{font-weight:700;font-size:22px;color:#000;opacity:.85;margin-bottom:16px;}

        .total-container{display:flex;flex-direction:column;align-items:flex-start;margin-bottom:18px;}
        .total-value{font-weight:500;font-size:24px;color:#000;line-height:1.2;}
        .total-label{font-weight:300;font-size:14px;color:#000;opacity:.8;margin-top:2px;}
        .bar-container{height:28px;background:#eee;border-radius:14px;overflow:hidden;margin-bottom:24px;}
        .bar{display:flex;height:100%;border-radius:14px;}
        .bar-segment{flex:${totalContas > 0 ? '1 1 0' : '0'};min-width:${totalContas > 0 ? '10px' : '0'};}

        .table-container{width:100%;border-collapse:separate;border-spacing:0;margin-top:8px;table-layout:fixed;overflow:hidden;}
        .table-container thead th{position:relative;padding:14px 10px;text-align:left;font-size:14px;border-bottom:1px solid rgba(0,0,0,.15);overflow:hidden;}
        .table-container tbody td{padding:14px 10px;text-align:left;font-size:14px;border-bottom:1px solid rgba(0,0,0,.15);overflow:hidden;transition:padding .28s ease, opacity .28s ease, transform .28s ease;}
        .table-container td:not(:last-child), .table-container th:not(:last-child){border-right:1px solid rgba(0,0,0,.15);}
        .th-label{display:flex;align-items:center;gap:6px;font-weight:300;font-size:14px;color:#000;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .th-label svg{width:16px;height:16px;opacity:.75;flex-shrink:0;}

        /* HACHURAS DIAGONAL NO CANTO INFERIOR DIREITO */
        .resize-handle {
          position: absolute;
          right: 6px;
          bottom: 6px;
          width: 12px;
          height: 12px;
          cursor: col-resize;
          z-index: 1;
          opacity: 0.25;
          transition: opacity .2s;
        }
        .resize-handle:hover {
          opacity: 0.6;
        }
        .resize-handle::before,
        .resize-handle::after {
          content: '';
          position: absolute;
          width: 8px;
          height: 1px;
          background: #888;
          border-radius: 1px;
        }
        .resize-handle::before {
          transform: rotate(45deg);
          top: 4px;
          left: 2px;
        }
        .resize-handle::after {
          transform: rotate(-45deg);
          top: 7px;
          left: 2px;
        }

        .tag-display{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:9999px;font-weight:700;font-size:13px;min-height:28px;cursor:pointer;transition:all .2s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;}
        .tag-display svg{width:12px;height:12px;flex-shrink:0;}
        .tag-display.empty{background:#f3f4f6 !important;color:#6b7280 !important;}
        .resp{border-radius:50%;width:24px;height:24px;flex-shrink:0;}
        .add-row{margin-top:16px;color:#888;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;font-weight:600;font-size:15px;}
        .check-circle{width:23px;height:23px;border:2px solid #000;border-radius:50%;cursor:pointer;transition:background .2s;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
        .check-circle.checked{background:#C1D9C1;border-color:#000;}
        .edit-input{width:100%;border:none;outline:none;font-size:14px;padding:4px 0;background:#fafafa;border-radius:4px;}
        .edit-input:focus{background:#fff;box-shadow:0 0 0 1px #667467;}

        /* ANIMAÇÃO DE REMOÇÃO SUAVE */
        .removing {
          opacity: 0;
          transform: translateY(-8px);
          height: 0 !important;
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          margin: 0 !important;
          overflow: hidden;
        }

        .lista-contas{display:grid;grid-template-columns:1fr 1fr;gap:16px 32px;list-style:none;padding:0;}
        .conta-item{display:flex;align-items:center;gap:12px;font-size:14.5px;background:#fafafa;padding:8px 12px;border-radius:12px;}
        .bolinha{width:28px;height:28px;border-radius:50%;flex-shrink:0;}
        .conta-input{border:none;outline:none;font-size:14.5px;padding:2px 0;width:100%;background:transparent;font-weight:600;}
        .conta-input:focus{background:#fff;border-radius:4px;box-shadow:0 0 0 1px #667467;}
        .valor-input{text-align:right;font-family:monospace;letter-spacing:0.5px;}

        .overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.65);display:flex;justify-content:center;align-items:center;z-index:1000;}
        .popup-card{width:685px;background:#fafafa;border-radius:35px;box-shadow:0 1px 3px rgba(0,0,0,.1);padding:32px;}
        .popup-title{font-weight:700;font-size:28px;margin-bottom:24px;letter-spacing:-.5px;text-align:center;}
        .popup-form{display:flex;flex-direction:column;gap:16px;}
        .conviteRow{display:flex;align-items:center;gap:10px;}
        .inputWrapper{position:relative;flex:1;}
        .floatingLabel{position:absolute;left:12px;top:8px;font-weight:700;font-size:12px;color:#111827;pointer-events:none;transition:color .16s;}
        .input{width:100%;padding:22px 12px 8px 12px;border:1px solid #d1d5db;border-radius:5px;font-size:14px;outline:none;transition:border-color .16s;}
        .input:focus{border-color:#667467;}
        .inputWrapper:focus-within .floatingLabel{color:#667467;}
        .smallButton{background:transparent;border:1px solid transparent;border-radius:8px;cursor:pointer;padding:12px 18px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;transition:border-color .3s;}
        .smallButton::before{content:"";position:absolute;inset:0;background:#C1D9C1;opacity:1;transition:opacity .3s;z-index:0;}
        .smallButton:hover::before{opacity:.25;}
        .smallButton:hover{border-color:#667467;}
        .smallButton img{width:20px;height:20px;position:relative;z-index:1;}
        .divider{display:flex;align-items:center;justify-content:center;width:100%;margin:24px 0;gap:12px;}
        .dividerLine{flex:1;height:1px;background:#d1d5db;}
        .dividerText{font-size:14px;color:#9ca3af;white-space:nowrap;}
        .submitButton{width:100%;background:transparent;color:#000;font-weight:700;padding:15px 0;border:1px solid transparent;border-radius:8px;cursor:pointer;position:relative;overflow:hidden;transition:border-color .3s;}
        .submitButton::before{content:"";position:absolute;inset:0;background:#C1D9C1;opacity:1;transition:opacity .3s;z-index:0;}
        .submitButton:hover::before{opacity:.21;}
        .submitButton:hover{border-color:#667467;}
        .submitButton span{position:relative;z-index:1;}

        .popup-invite{background:#fff;border-radius:28px;padding:28px;width:90%;max-width:520px;box-shadow:0 20px 60px rgba(0,0,0,.25);}
        .invite-title{font-weight:700;font-size:28px;margin-bottom:20px;letter-spacing:-.5px;text-align:center;color:#111;}
        .codeContainer{display:flex;align-items:center;gap:12px;padding:16px;background:#f9f9f9;border-radius:12px;border:1px solid #e5e7eb;}
        .codeWrapper{flex:1;display:flex;align-items:center;gap:10px;}
        .eyeButton{background:none;border:none;cursor:pointer;padding:6px;border-radius:8px;transition:background .2s;display:flex;align-items:center;justify-content:center;}
        .eyeButton:hover{background:#e5e7eb;}
        .eyeButton img{width:auto;height:24px;object-fit:contain;}
        .eyeButton img.naover{height:25px;}
        .codeDisplay{flex:1;font-family:monospace;font-size:16px;letter-spacing:1.5px;color:#111;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;user-select:text;}
        .copyButton{background:transparent;border:1px solid transparent;border-radius:8px;cursor:pointer;width:44px;height:44px;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;transition:border-color .3s;flex-shrink:0;}
        .copyButton::before{content:"";position:absolute;inset:0;background:#C1D9C1;opacity:1;transition:opacity .3s;z-index:0;}
        .copyButton:hover::before{opacity:.21;}
        .copyButton:hover{border-color:#667467;}
        .copyButton img{width:18px;height:18px;position:relative;z-index:1;transition:opacity .3s;}
        .copyButton.copied img{opacity:0;}
        .copyButton.copied::after{content:"";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:18px;height:18px;background:url('/copiado.png') no-repeat center;background-size:contain;z-index:1;}

        .context-menu{position:fixed;background:#fff;border-radius:35px;box-shadow:0 20px 60px rgba(0,0,0,.25);padding:16px 20px;z-index:10000;min-width:180px;border:1px solid rgba(0,0,0,.05);}
        .context-item{display:flex;align-items:center;gap:10px;padding:12px 16px;font-size:14px;font-weight:600;color:#333;cursor:pointer;border-radius:20px;margin-bottom:8px;transition:all .2s;}
        .context-item:hover{background:#f7f7f7;transform:translateY(-2px);}
        .context-item.danger{color:#dc2626;}
        .context-item.danger:hover{background:#fee2e2;}
        .context-item svg{width:16px;height:16px;}
      `}</style>

      <div className="container">
        <aside className="sidebar">
          <div className="profile">
            <img src="/p1.png" alt="perfil" />
            <span>Jabuti de lago</span>
          </div>

          <ul className="menu">
            <li><FiSettings /> Configurações</li>
            <li><FiBell /> Notificações</li>
            <li><FiUser /> Conta</li>
          </ul>

          <div className="groups">
            <p>Grupos</p>
            {groups.map(g => (
              <div
                key={g.id}
                className={`group-item ${selectedGroup?.id === g.id ? 'active' : ''}`}
                onClick={() => setSelectedGroup(g)}
                onContextMenu={(e) => openContextMenu(e, g)}
              >
                <img src={g.icon} alt="grupo" />
                {editingGroupId === g.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onBlur={saveRename}
                    onKeyDown={e => e.key === 'Enter' ? saveRename() : e.key === 'Escape' ? setEditingGroupId(null) : null}
                    autoFocus
                    style={{ fontSize: '15px', fontWeight: 500, border: '1px solid #667467', borderRadius: 4, padding: '2px 4px', width: '100%' }}
                  />
                ) : (
                  <span>{g.name}</span>
                )}
              </div>
            ))}
            <div className="add-group" onClick={() => setShowCreateGroup(true)}>
              <FiPlus style={{ fontSize: '18px' }} />
            </div>
          </div>
        </aside>

        {selectedGroup ? (
          <main className="main" ref={mainRef}>
            <div className="fixed-header">
              <div className="header-content">
                <img src={selectedGroup.icon} alt="grupo" style={{ width: 28, height: 28 }} />
                <span style={{ fontSize: '18px', fontWeight: 700 }}>{selectedGroup.name}</span>
              </div>
              <div className="header-actions">
                <img src="/editar.png" alt="editar" />
                <img src="/favoritar.png" alt="favoritar" />
                <span className="share-text">Share</span>
              </div>
            </div>

            <div className="content">
              <div className="title-section">
                <div className="title-left">
                  <img src={selectedGroup.icon} alt="grupo" className="plant-large" />
                  <h1 className="group-name">{selectedGroup.name}</h1>
                  <div className="members-line">
                    <div className="profile-stack">
                      <img src="/p1.png" alt="p1" className="profile-img" />
                      <img src="/p2.png" alt="p2" className="profile-img" />
                      <img src="/p3.png" alt="p3" className="profile-img" />
                      <img src="/p4.png" alt="p4" className="profile-img" />
                    </div>
                    <span>4 pessoas estão nesse grupo</span>
                  </div>
                </div>
              </div>

              {/* TAREFAS */}
              <section className="dashboard">
                <h3>Tarefas</h3>
                <div style={{ overflow: 'hidden', borderRadius: 12 }}>
                  <table className="table-container">
                    <colgroup>
                      {columnWidths.tarefas.map((w, i) => <col key={i} style={{ width: w, maxWidth: w }} />)}
                    </colgroup>
                    <thead>
                      <tr>
                        {['Check', 'Descrição', 'Status', 'Prioridade', 'Data', 'Responsável'].map((label, i) => (
                          <th key={i}>
                            <div className="th-label">
                              {i === 0 && <FiCheck />}
                              {i === 1 && <FiAlignLeft />}
                              {i === 2 && <FiCheckSquare />}
                              {i === 3 && <FiAlertCircle />}
                              {i === 4 && <FiCalendar />}
                              {i === 5 && <FiUser />}
                              <span>{label}</span>
                            </div>
                            {i < 5 && (
                              <div
                                className="resize-handle"
                                onPointerDown={(e) => startResize(e, 'tarefas', i)}
                              />
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tarefas.map(t => (
                        <tr
                          key={t.id}
                          className={removingTaskId === t.id ? 'removing' : ''}
                          style={{
                            transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                            height: removingTaskId === t.id ? 0 : 'auto'
                          }}
                        >
                          <td>
                            <div
                              className={`check-circle ${t.checked ? 'checked' : ''}`}
                              onClick={() => !t.checked && handleTaskCheck(t.id)}
                            />
                          </td>
                          <td>
                            {t.editing || editingTask === t.id ? (
                              <input
                                type="text"
                                className="edit-input"
                                value={t.descricao}
                                onChange={e => setTarefas(prev => prev.map(task => task.id === t.id ? { ...task, descricao: e.target.value } : task))}
                                onBlur={() => saveTask(t.id)}
                                onKeyDown={e => e.key === 'Enter' && saveTask(t.id)}
                                autoFocus
                              />
                            ) : (
                              <span onClick={() => setEditingTask(t.id)}>{t.descricao || 'Clique para editar'}</span>
                            )}
                          </td>
                          <td>
                            <div
                              className={`tag-display ${!t.status ? 'empty' : ''}`}
                              style={{
                                backgroundColor: !t.status ? '#f3f4f6' : 
                                  t.status === 'Concluída' ? '#d5f5e3' : 
                                  t.status === 'Em andamento' ? '#fef3c7' : '#e5e7eb',
                                color: !t.status ? '#9ca3af' : 
                                  t.status === 'Concluída' ? '#2e7d32' : 
                                  t.status === 'Em andamento' ? '#d97706' : '#4b5563'
                              }}
                              onClick={() => cycleStatus(t.id)}
                            >
                              {t.status || 'Selecionar'} <FiChevronDown />
                            </div>
                          </td>
                          <td>
                            <div
                              className="tag-display"
                              style={{
                                backgroundColor: t.prioridade === 'Alta' ? '#fee2e2' : t.prioridade === 'Média' ? '#f3e8ff' : '#dbeafe',
                                color: t.prioridade === 'Alta' ? '#dc2626' : t.prioridade === 'Média' ? '#9333ea' : '#2563eb'
                              }}
                              onClick={() => cyclePrioridade(t.id, true)}
                            >
                              {t.prioridade} <FiChevronDown />
                            </div>
                          </td>
                          <td>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDatePicker(showDatePicker === t.id ? null : t.id);
                              }}
                              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                            >
                              <FiCalendar />
                              {t.data || 'Selecionar'}
                            </div>
                            {showDatePicker === t.id && renderDatePicker(t.id, t.data)}
                          </td>
                          <td>
                            <img src={t.responsavel} alt="resp" className="resp" />
                            {t.editing && (
                              <FiTrash2 style={{ marginLeft: 8, cursor: 'pointer', color: '#dc2626' }} onClick={() => deleteTask(t.id)} />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="add-row" onClick={addTask}><FiPlus style={{ fontSize: '18px' }} /></div>
              </section>

              {/* CONTAS */}
              <section className="dashboard">
                <h3>Contas</h3>
                <div className="total-container">
                  <div className="total-value">R$ {formatCurrency(totalContas)}</div>
                  <div className="total-label">Montante total do mês</div>
                </div>

                <div className="bar-container">
                  <div className="bar">
                    {contas.map(c => c.valor > 0 && (
                      <div
                        key={c.id}
                        className="bar-segment"
                        style={{
                          backgroundColor: c.cor,
                          flex: `${c.valor} 1 0`,
                          minWidth: totalContas > 0 ? '10px' : '0'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <ul className="lista-contas">
                  {contas.map(c => (
                    <li key={c.id} className="conta-item">
                      <span className="bolinha" style={{ backgroundColor: c.cor }}></span>
                      <input
                        type="text"
                        className="conta-input"
                        value={c.nome}
                        onChange={e => updateConta(c.id, 'nome', e.target.value)}
                        placeholder="Sem categoria"
                      />
                      <input
                        type="text"
                        className="conta-input valor-input"
                        value={c.valor > 0 ? formatCurrency(c.valor) : ''}
                        onChange={e => updateConta(c.id, 'valor', e.target.value)}
                        placeholder="R$ 0,00"
                        style={{ width: 90 }}
                      />
                    </li>
                  ))}
                </ul>
              </section>

              {/* LISTA DE COMPRAS */}
              <section className="dashboard">
                <h3>Lista de compras</h3>
                <div style={{ overflow: 'hidden', borderRadius: 12 }}>
                  <table className="table-container">
                    <colgroup>
                      {columnWidths.compras.map((w, i) => <col key={i} style={{ width: w, maxWidth: w }} />)}
                    </colgroup>
                    <thead>
                      <tr>
                        {['Comprado?', 'Produto', 'Tipo', 'Valor', 'Prioridade', 'Responsável'].map((label, i) => (
                          <th key={i}>
                            <div className="th-label">
                              {i === 0 && <FiCheck />}
                              {i === 1 && <FiAlignLeft />}
                              {i === 2 && <FiTag />}
                              {i === 3 && <FiDollarSign />}
                              {i === 4 && <FiAlertCircle />}
                              {i === 5 && <FiUser />}
                              <span>{label}</span>
                            </div>
                            {i < 5 && (
                              <div
                                className="resize-handle"
                                onPointerDown={(e) => startResize(e, 'compras', i)}
                              />
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {compras.map(c => (
                        <tr
                          key={c.id}
                          className={removingCompraId === c.id ? 'removing' : ''}
                          style={{
                            transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                            height: removingCompraId === c.id ? 0 : 'auto'
                          }}
                        >
                          <td>
                            <div
                              className={`check-circle ${c.checked ? 'checked' : ''}`}
                              onClick={() => !c.checked && handleCompraCheck(c.id)}
                            />
                          </td>
                          <td>
                            {c.editing || editingCompra === c.id ? (
                              <input
                                type="text"
                                className="edit-input"
                                value={c.produto}
                                onChange={e => setCompras(prev => prev.map(compra => compra.id === c.id ? { ...compra, produto: e.target.value } : compra))}
                                onBlur={() => saveCompra(c.id)}
                                onKeyDown={e => e.key === 'Enter' && saveCompra(c.id)}
                                autoFocus
                              />
                            ) : (
                              <span onClick={() => setEditingCompra(c.id)}>{c.produto || 'Clique para editar'}</span>
                            )}
                          </td>
                          <td>
                            <div
                              className="tag-display"
                              style={{
                                backgroundColor: c.tipo === 'Limpeza' ? '#f9a8d4' : c.tipo === 'Comida' ? '#fecaca' : '#fee2e2',
                                color: c.tipo === 'Limpeza' ? '#be185d' : c.tipo === 'Comida' ? '#991b1b' : '#ea580c'
                              }}
                              onClick={() => cycleTipo(c.id)}
                            >
                              {c.tipo} <FiChevronDown />
                            </div>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="edit-input"
                              value={c.valor ? formatCurrency(parseFloat(c.valor)) : ''}
                              onChange={e => updateCompraValor(c.id, e.target.value)}
                              placeholder="R$ 0,00"
                              style={{ width: 70, textAlign: 'right', fontFamily: 'monospace' }}
                            />
                          </td>
                          <td>
                            <div
                              className="tag-display"
                              style={{
                                backgroundColor: c.prioridade === 'Alta' ? '#fee2e2' : c.prioridade === 'Média' ? '#f3e8ff' : '#dbeafe',
                                color: c.prioridade === 'Alta' ? '#dc2626' : c.prioridade === 'Média' ? '#9333ea' : '#2563eb'
                              }}
                              onClick={() => cyclePrioridade(c.id, false)}
                            >
                              {c.prioridade} <FiChevronDown />
                            </div>
                          </td>
                          <td>
                            <img src={c.responsavel} alt="resp" className="resp" />
                            {c.editing && (
                              <FiTrash2 style={{ marginLeft: 8, cursor: 'pointer', color: '#dc2626' }} onClick={() => deleteCompra(c.id)} />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="add-row" onClick={addCompra}><FiPlus style={{ fontSize: '18px' }} /></div>
              </section>
            </div>
          </main>
        ) : (
          <main className="main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            <p>Clique em + para criar ou entrar em um grupo</p>
          </main>
        )}
      </div>

      {/* MENU DE CONTEXTO */}
      {contextMenu && (
        <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={e => e.stopPropagation()}>
          <div className="context-item" onClick={() => startRename(groups.find(g => g.id === contextMenu.groupId))}>
            <FiEdit3 /> Renomear
          </div>
          <div className="context-item danger" onClick={deleteGroup}>
            <FiTrash2 /> Excluir
          </div>
        </div>
      )}

      {/* POPUP: CRIAR/ENTRAR */}
      {showCreateGroup && (
        <div className="overlay" onClick={closePopups}>
          <div className="popup-card" onClick={e => e.stopPropagation()}>
            <h1 className="popup-title">Você ainda não está associado a nenhum grupo doméstico</h1>

            <form className="popup-form" onSubmit={handleJoinWithInvite}>
              <div className="conviteRow">
                <div className="inputWrapper">
                  <span className="floatingLabel">CONVITE</span>
                  <input
                    type="text"
                    className="input"
                    placeholder="Cole aqui o convite de um grupo já existente"
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value)}
                  />
                </div>
                <button type="submit" className="smallButton">
                  <img src="/open.png" alt="Entrar" />
                </button>
              </div>
            </form>

            <div className="divider">
              <div className="dividerLine"></div>
              <span className="dividerText">ou</span>
              <div className="dividerLine"></div>
            </div>

            <form className="popup-form" onSubmit={handleCreateGroup}>
              <p style={{ fontSize: '16px', marginBottom: '16px', color: '#6b7280' }}>Crie o seu próprio grupo!</p>

              <div className="inputWrapper">
                <span className="floatingLabel">NOME</span>
                <input
                  type="text"
                  className="input"
                  placeholder="Digite o nome do grupo"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  required
                />
              </div>

              <div className="inputWrapper">
                <span className="floatingLabel">DESCRIÇÃO</span>
                <input
                  type="text"
                  className="input"
                  placeholder="Descreva brevemente o seu grupo"
                  value={groupDescription}
                  onChange={e => setGroupDescription(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="submitButton">
                <span>Cadastrar grupo</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP: CÓDIGO */}
      {showInviteCode && (
        <div className="overlay" onClick={closePopups}>
          <div className="popup-invite" onClick={e => e.stopPropagation()}>
            <h2 className="invite-title">Convide amigos para o seu grupo</h2>
            <div className="codeContainer">
              <div className="codeWrapper">
                <button className="eyeButton" onClick={() => setShowCode(!showCode)} type="button">
                  <img src={showCode ? '/naover.png' : '/ver.png'} alt={showCode ? 'Ocultar' : 'Ver'} className={showCode ? 'naover' : ''} />
                </button>
                <div className="codeDisplay">
                  {showCode ? (generatedCode || 'Código não disponível') : '●●●●●●●●●●●●●●●●●●●●'}
                </div>
              </div>
              <button className={`copyButton ${copied ? 'copied' : ''}`} onClick={handleCopy} type="button">
                <img src="/copiar.png" alt="Copiar" style={{ opacity: copied ? 0 : 1 }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {userIdDebug && (
        <div style={{
          position: 'fixed', bottom: 8, right: 8, background: '#111', color: '#fff',
          padding: '6px 10px', borderRadius: 8, fontSize: 12, zIndex: 9999, fontFamily: 'monospace'
        }}>
          UID: {userIdDebug}
        </div>
      )}
    </>
  );
}