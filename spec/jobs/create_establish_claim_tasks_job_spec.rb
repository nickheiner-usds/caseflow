describe CreateEstablishClaimTasksJob do
  before do
    reset_application!

    @partial_grant = Fakes::AppealRepository.create("123C", :appeal_remand_decided)
    @full_grant = Fakes::AppealRepository.create("456D", :appeal_full_grant_decided, decision_date: 1.day.ago)

    allow(AppealRepository).to receive(:remands_ready_for_claims_establishment).and_return([@partial_grant])
    allow(AppealRepository).to receive(:amc_full_grants).and_return([@full_grant])
    Timecop.freeze(Time.utc(2015, 1, 10, 12, 8, 0))
  end

  after { Timecop.return }

  context ".perform" do
    it "creates tasks" do
      expect(Task.count).to eq(0)
      CreateEstablishClaimTasksJob.perform_now
      expect(Task.count).to eq(2)
    end

    context "full grants beyond 3 days" do
      before do
        @full_grant.update(decision_date: 10.days.ago)
      end

      it "filters them out" do
        expect(Task.count).to eq(0)
        CreateEstablishClaimTasksJob.perform_now
        expect(Task.count).to eq(2)
      end
    end
  end

  context ".full_grant_decided_after" do
    subject { CreateEstablishClaimTasksJob.new.full_grant_decided_after }
    it "returns a date 3 days earlier at midnight" do
      is_expected.to eq(Time.utc(2015, 1, 7, 0))
    end
  end
end
